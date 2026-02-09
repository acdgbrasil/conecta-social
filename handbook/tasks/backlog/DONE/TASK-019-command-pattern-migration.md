# TASK-019 - Command Pattern Migration (Social Care)

**Status:** ✅ Done

## Objetivo
Aplicar o padrao Command como contrato de entrada dos Use Cases, removendo acoplamentos de DTOs e fortalecendo Ports & Adapters.

## Escopo
- Modulo `social-care`.
- Apenas estrutura e contratos (sem mudancas de regra de negocio).

## Checklist de execucao (por partes)

- [x] Definir convencao de pastas para Commands/Queries (ex.: `src/modules/social-care/application/ports/commands`).
- [x] Mapear todos os inputs atuais do dominio (arquivos em `src/modules/social-care/domain/inputs`).
- [x] Criar Commands equivalentes no Application para cada Use Case:
- [x] `AddFamilyMember`
- [x] `AssignPrimaryCaregiver`
- [x] `CreateReferral`
- [x] `RegisterAppointment`
- [x] `RegisterNewPatient`
- [x] `RemoveFamilyMember`
- [x] `ReportRightsViolation`
- [x] `UpdateHousingCondition`
- [x] `UpdateSocioEconomicSituation`
- [x] Atualizar os Use Cases para receber Commands (trocar imports de `domain/inputs` para `application/ports/commands`).
- [x] Remover ou migrar `domain/inputs` que ficaram redundantes (decidido: removidos).
- [x] Atualizar testes de Use Case para construir Commands (sem mudancas necessarias; inputs ja compativeis).
- [x] Revisar mapper `social-assessment.mapper.ts` e mover para Adapter (inbound) quando DTOs forem definidos em `interface`.
- [x] Criar DTOs do Adapter (REST/gRPC) e mapeadores para Commands (adapters em `src/modules/social-care/interface/adapter/commands`).
- [x] Atualizar documentacao em `handbook/architecture/command.md` com exemplos reais (Command + Query).

## Observacoes
- Hoje, os inputs de dominio em `domain/inputs` sao usados apenas pelos Use Cases.
- As Queries atuais aparecem no repositório (ex.: `findByPersonId`, `existsByPersonId`). Quando surgirem use cases de leitura, definir Queries no mesmo padrao dos Commands.
- Referencia: problemas mapeados em `handbook/architecture/mapper-problems.md`.
