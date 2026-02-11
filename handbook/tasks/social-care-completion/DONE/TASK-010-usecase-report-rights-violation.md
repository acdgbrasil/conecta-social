# [TASK-010] UseCase: ReportRightsViolation

**Status:** 🟢 Done
**Prioridade:** Alta
**Labels:** `feature`, `application`
**Nota:** Implementação concluída via `TASK-013`.

## Descrição
Registrar suspeita ou confirmação de violação de direitos (negligência, violência, etc.).

## Sensibilidade
- Este é um dado sensível. Garantir que o fluxo de persistência proteja a integridade desse registro.
- Validar consistência temporal (`incidentDate` <= `reportDate`).

## Critérios de Aceite
- [x] Use Case implementado (ver `TASK-013`).
- [x] Persistência segura.
- [x] Evento `RightsViolationReported` disparado.
