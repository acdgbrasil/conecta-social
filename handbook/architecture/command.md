# Command Pattern (Use Case Input)

## Exemplo teorico (citacao do livro)

> "Command: Task Wrapper - Turns a request into an object, ready for action."
>
> Fonte: `System-Design-The-big-archive-Alex-Xu-2023.txt`

## O que e

O livro descreve Command como um "task wrapper" que transforma uma requisicao em um objeto pronto para acao. Em termos praticos, Command e um **objeto de intencao**: ele encapsula todos os dados necessarios para executar uma acao do sistema. Em Ports & Adapters, o Command vive na **porta de entrada** do Application e representa o contrato do Use Case. O adapter (REST/gRPC/UI) traduz o DTO externo para esse Command, mantendo o dominio e a aplicacao desacoplados do formato de transporte.

Regra pratica:
- Acoes que **mudam estado** recebem Command.
- Leituras recebem Query/Request (nao Command).

## Diferenca conceitual: Query vs Command

Command representa **intencao de mudar estado**: criar, atualizar, remover, registrar. Ele pode causar efeitos colaterais e precisa de validacao de invariantes de dominio. Query representa **intencao de ler**: obter dados sem alterar o estado do sistema. Em Ports & Adapters, ambos podem ser tratados como contratos de entrada, mas a semantica e diferente: Command altera, Query apenas consulta.

### Exemplos de Query no projeto

Hoje, as consultas aparecem como operacoes de leitura no repositório (nao como Use Cases dedicados). Exemplos:
- `PatientRepositoryPort.existsByPersonId(personId)` em `src/modules/social-care/domain/repository/patient.repository.port.ts` (consulta booleana).
- `PatientRepositoryPort.findByPersonId(personId)` em `src/modules/social-care/domain/repository/patient.repository.port.ts` (busca agregados).

Se futuramente criarmos use cases de leitura, eles deveriam receber um Query como:
- `GetPatientByPersonIdQuery` (entrada apenas com `personId`), retornando um DTO de leitura.

## Exemplo real do projeto (estado atual)

Situacao atual (padrao aplicado):
- Commands vivem em `src/modules/social-care/application/ports/commands/**`.
- Adapters criam Commands a partir de `unknown` com Zod em `src/modules/social-care/interface/adapter/commands/**`.
- Use cases recebem Commands diretamente (ex: `RegisterNewPatientUseCase` usa `RegisterNewPatientCommand`).
- Exemplo de adapter: `src/modules/social-care/interface/adapter/commands/register-new-patient.command.adapter.ts`.

Exemplo especifico (update housing):
- Command: `src/modules/social-care/application/ports/commands/update-housing-condition.command.ts`.
- Adapter: `src/modules/social-care/interface/adapter/commands/update-housing-condition.command.adapter.ts`.
- Use case: `src/modules/social-care/application/use-cases/update-housing-condition.use-case.ts`.

Isso isola o core de mudancas no transporte e centraliza a intencao do caso de uso.

## Vantagens

- Desacopla o core dos DTOs de transporte.
- Facilita testes do Use Case (input simples, estavel).
- Ajuda versionamento do contrato (Command v1, v2).
- Permite enfileirar/reprocessar intencoes como mensagens.
- Padroniza logs, auditoria e rastreabilidade de acoes.

## Desvantagens

- Mais arquivos e mapeamentos para manter.
- Pode gerar tipos redundantes se mal organizado.
- Pequena friccao inicial para times acostumados com DTO direto.

## Diagrama conceitual da conexao

```mermaid
flowchart LR
  Adapter[Adapter REST/gRPC] -->|DTO| InMapper[Inbound Mapper (Adapter)]
  InMapper -->|Command| UseCase[Use Case (Application)]
  UseCase --> Domain[Domain]
  Domain --> UseCase
  UseCase -->|Result/Response| Adapter
```
