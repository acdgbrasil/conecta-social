# 📔 Estudo de Caso: Refatoração da Camada de Aplicação (OOP para FP)

Este documento registra a transformação técnica da camada `application` do projeto Conecta Social, comparando o modelo clássico de Orientação a Objetos (OOP) com o modelo Funcional (FP) utilizando o motor `UseCasePipeline`.

---

## 🏗️ 1. O Cenário Inicial: OOP Clássico
No modelo inicial, cada Use Case era uma classe que gerenciava manualmente seu ciclo de vida, dependências e fluxo de erros.

### Exemplo: `CreateReferralUseCase` (Antes)
```typescript
export class CreateReferralUseCase implements UseCasePort<CreateReferralCommand, Result<boolean, DomainError>> {
  constructor(
    private readonly repository: PatientRepositoryPort,
    private readonly eventBus: EventBusPort,
    private readonly clock: ClockPort,
  ) {}

  async execute(command: Readonly<CreateReferralCommand>): Promise<Result<boolean, DomainError>> {
    // Boilerplate de Parsing Manual
    const patientIdRes = PersonId.create(command.patientId);
    if (Result.isErr(patientIdRes)) return Result.err(patientIdRes.error);

    const referredIdRes = Uuid.create(command.referredPersonId);
    if (Result.isErr(referredIdRes)) return Result.err(referredIdRes.error);

    // Orquestração Imperativa (Await Hell + Error Checks)
    const patientRes = await this.repository.findByPersonId(patientIdRes.value);
    if (Result.isErr(patientRes)) return Result.err(patientRes.error);

    const updatedRes = Patient.createReferral(patientRes.value, { ... }, this.clock.now(), ...);
    if (Result.isErr(updatedRes)) return Result.err(updatedRes.error);

    // Persistência e Eventos Manuais
    const saveRes = await this.repository.save(updatedRes.value);
    if (Result.isErr(saveRes)) return Result.err(saveRes.error);

    const { events } = Patient.pullDomainEvents(updatedRes.value);
    this.eventBus.publish(events);

    return Result.ok(true);
  }
}
```

---

## 🚀 2. O Estado da Arte: Functional ROP
No novo modelo, o Use Case torna-se uma **definição de pipeline**. A complexidade de infraestrutura é abstraída pelo `UseCasePipeline.build`.

### Exemplo: `makeCreateReferralUseCase` (Depois)
```typescript
export const makeCreateReferralUseCase = (deps: CreateReferralDeps) =>
  UseCasePipeline.build({
    // Passo 1: Parsing Atômico (Puro)
    parse: (command) => Result.combine({
      patientId: PersonId.create(command.patientId),
      referredId: Uuid.create(command.referredPersonId),
      // ...
    }),

    // Passo 2: Lógica de Negócio (Linear com yield)
    handle: async function* (ctx) {
      const patient = yield deps.repository.findByPersonId(ctx.patientId);
      const updated = yield Patient.createReferral(patient, { ... }, deps.clock.now(), ...);
      
      return Result.ok({ aggregate: updated, result: true });
    },

    // Passo 3: Infraestrutura (Automatizada)
    repository: deps.repository,
    eventBus: deps.eventBus,
    pullEvents: Patient.pullDomainEvents,
  });
```

---

## 🎯 3. Patterns Aplicados

1.  **Railway Oriented Programming (ROP):** O fluxo é tratado como um trilho. Qualquer erro em qualquer etapa (Parsing, Loading, Domain, Persistence) desvia o trem para o trilho de erro automaticamente.
2.  **Monadic Comprehension (Generators/yield):** O uso de `yield` permite escrever código assíncrono funcional de forma linear, eliminando o aninhamento de `if (isErr)` e mantendo a tipagem forte.
3.  **Functional Factory (HOF):** Substituição de classes por funções de alta ordem que capturam dependências via closure, eliminando bugs de contexto (`this.`).
4.  **Parsing Contextual (`Result.combine`):** Validação declarativa de múltiplos campos, garantindo que o `handle` receba apenas dados de domínio 100% válidos.

---

## 📊 4. Análise de Ganhos

| Métrica | Antes (OOP) | Depois (FP) | Impacto |
| :--- | :--- | :--- | :--- |
| **Linhas de Código (Média)** | ~70-90 | ~30-40 | **-50%** de código para manter |
| **Complexidade Ciclomática** | Alta (muitos `if`) | Baixa (linear) | Redução drástica de caminhos de erro manuais |
| **Boilerplate de Infra** | Repetido em cada arquivo | Centralizado no motor | Foco total na Regra de Negócio |
| **Context Safety** | Risco de `this` undefined | Imune (Closures) | Menos bugs em runtime |
| **Testabilidade** | Exige mocks complexos | Fácil (Funções Puras) | Testes mais rápidos e isolados |

---

## 🧠 5. Conclusão para o Artigo
A transição para o modelo funcional estruturado provou que é possível ter um sistema robusto e "Enterprise" sem a verbosidade das classes tradicionais. O `UseCasePipeline` age como um **Engenheiro de Ferrovia**, permitindo que o desenvolvedor foque apenas em definir as estações (lógica) sem se preocupar com a manutenção dos trilhos (erros e infra).
