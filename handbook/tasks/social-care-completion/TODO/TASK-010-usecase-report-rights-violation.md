# [TASK-010] UseCase: ReportRightsViolation

**Status:** 🔴 To Do
**Prioridade:** Alta
**Labels:** `feature`, `application`
**Nota:** Execução pendente; ver `handbook/tasks/stabilization/TASK-013-implement-report-rights-violation.md`.

## Descrição
Registrar suspeita ou confirmação de violação de direitos (negligência, violência, etc.).

## Sensibilidade
- Este é um dado sensível. Garantir que o fluxo de persistência proteja a integridade desse registro.
- Validar consistência temporal (`incidentDate` <= `reportDate`).

## Critérios de Aceite
- [ ] Use Case implementado.
- [ ] Persistência segura.
- [ ] Evento `RightsViolationReported` disparado.
