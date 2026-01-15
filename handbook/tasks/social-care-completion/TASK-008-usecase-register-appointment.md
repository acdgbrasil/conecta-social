# [TASK-008] UseCase: RegisterAppointment (Evolução)

**Status:** [ ] Aberto
**Prioridade:** Alta
**Labels:** `feature`, `application`

## Descrição
Registrar que um atendimento (visita, entrevista, acolhimento) ocorreu. Isso compõe o histórico longitudinal do paciente.

## Entrada
- `patientId`
- `summary` (Resumo do atendimento)
- `actionPlan` (Encaminhamentos/Plano)
- `date`
- `professionalId`

## Critérios de Aceite
- [ ] Use Case implementado.
- [ ] Disparo do evento `SocialCareAppointmentRegistered` (se aplicável/definido).
- [ ] O atendimento deve ser persistido na lista `appointments` do agregado.
