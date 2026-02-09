# Decisão Arquitetural — Acoplamento Command-Handler

## Contexto
No padrão Command atual, os Commands (Intenções) são processados por Use Cases (Handlers). Atualmente, a conexão entre o chamador (Controller/Adapter) e o Use Case é feita via **injeção direta e chamada manual**. Foi avaliada a introdução de um **Command Dispatcher (ou Command Bus)** para mediar essa conexão.

## Decisão
1. **Não utilizaremos Dispatcher dinâmico** no estágio atual do projeto.
2. A conexão entre Command e Use Case permanecerá **explícita e estática**.
3. Cada Use Case continua sendo o Handler único de seu respectivo Command.

## Motivação (Por que não usar Dispatcher agora?)
- **Simplicidade (KISS):** A injeção direta via construtor nos Controllers já provê desacoplamento suficiente para testes e substituição de implementações.
- **Tipagem Forte:** O TypeScript infere o retorno do Use Case (`Result<T, E>`) de forma nativa e sem necessidade de genéricos complexos ou "type gymnastics" que um Dispatcher genérico exigiria para manter a segurança de tipos total.
- **Transparência:** É mais fácil para um desenvolvedor rastrear "quem executa o quê" via "Go to Definition" do que através de um barramento de mensagens em memória.
- **Redução de Boilerplate:** Evitamos a necessidade de registrar Handlers em um barramento centralizado.

## Quando Reavaliar?
A introdução de um Dispatcher será considerada se:
- Surgir a necessidade de **Middlewares de Pipeline** globais (ex: logging automático, métricas de execução ou transações de banco de dados automáticas para todos os comandos).
- O número de Use Cases em um único Controller tornar a lista de dependências no construtor insustentável.

## Diretriz de implementação
- O Controller deve injetar o Use Case específico e chamar `.execute(command)`.
- Use o pattern de **Parsing Contextual** dentro do Use Case para transformar o Command em dados de domínio tipados (`Result.combine`).

---

# Decisão Arquitetural — Padrão Funcional para Use Cases (ROP + Generators)

## Contexto
Durante a refatoração para o modelo funcional (FP), identificamos que o padrão clássico de Classes (`class UseCase implements UseCasePort`) gerava boilerplate excessivo e repetitivo:
1. Construtores com `this.` para dependências.
2. Verificações manuais de erro (`if (res.isErr) return res.error`) a cada passo.
3. Repetição de lógica de infraestrutura (salvar repositório, extrair e publicar eventos).

## Decisão (Evolução Funcional)
Substituímos a Classe tradicional por uma **Factory de Função (HOF)** combinada com um **Pipeline Declarativo** baseado em Generators.

### O Novo Padrão: `UseCasePipeline.build`
Todo Use Case deve ser construído utilizando o utilitário `UseCasePipeline.build` do pacote `@conecta/fn`.

### Estrutura Canônica
Um Use Case é definido por um objeto de configuração com 3 seções claras:

1.  **Parse (Puro):**
    *   Recebe o Command bruto.
    *   Utiliza `Result.combine` para validar e converter todos os campos em tipos de domínio (`PersonId`, `Uuid`, VOs) de uma só vez.
    *   Retorna um `Context` tipado e seguro.

2.  **Handle (Async Generator):**
    *   Recebe o `Context` validado.
    *   Utiliza **Generators (`function*`)** e **`yield`** para orquestrar o fluxo.
    *   O `yield` desembrulha automaticamente os `Result`s. Se houver erro, o fluxo para (Short-Circuit) e retorna o erro.
    *   Foca exclusivamente na regra de negócio: Carregar Agregado -> Chamar Método de Domínio -> Retornar Novo Estado.

3.  **Infraestrutura (Configuração):**
    *   Injeta as dependências (`repository`, `eventBus`) diretamente na configuração.
    *   O Pipeline executa automaticamente a persistência (`repo.save`) e a publicação de eventos (`eventBus.publish`) se o `handle` for bem-sucedido.

### Benefícios Alcançados
- **Zero Classes/This:** Eliminação completa de erros de contexto e redução de código verboso.
- **Railway Oriented Programming (ROP):** O fluxo de "caminho feliz" fica linear e legível, sem aninhamentos ou checagens de erro manuais.
- **Padronização:** Todos os Use Cases seguem rigorosamente a mesma estrutura auditável.
- **Type-Safety:** O TypeScript garante que a saída do `parse` é a entrada exata do `handle`.

### Exemplo de Implementação
```typescript
export const makeCreateReferralUseCase = (deps: Deps) => 
  UseCasePipeline.build({
    // 1. Parsing Contextual
    parse: (cmd) => Result.combine({ 
      patientId: PersonId.create(cmd.patientId),
      // ...
    }),

    // 2. Fluxo de Negócio (Linear)
    handle: async function* (ctx) {
      const patient = yield deps.repo.findByPersonId(ctx.patientId);
      const updated = yield Patient.createReferral(patient, ctx.draft, ...);
      
      return Result.ok({ aggregate: updated, result: true });
    },

    // 3. Automação de Infra
    repository: deps.repo,
    eventBus: deps.eventBus,
    pullEvents: Patient.pullDomainEvents
  });
```