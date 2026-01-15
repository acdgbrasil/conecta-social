# [TASK-010] UseCase: ReportRightsViolation

**Status:** [ ] Aberto
**Prioridade:** Alta
**Labels:** `feature`, `application`

## Descrição
Registrar suspeita ou confirmação de violação de direitos (negligência, violência, etc.).

## Sensibilidade
- Este é um dado sensível. Garantir que o fluxo de persistência proteja a integridade desse registro.
- Validar consistência temporal (`incidentDate` <= `reportDate`).

## Critérios de Aceite
- [ ] Use Case implementado.
- [ ] Persistência segura.
- [ ] Evento `RightsViolationReported` disparado.
