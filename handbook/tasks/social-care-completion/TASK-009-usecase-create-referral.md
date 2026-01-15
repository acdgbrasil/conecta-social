# [TASK-009] UseCase: CreateReferral (Encaminhamento)

**Status:** [ ] Aberto
**Prioridade:** Alta
**Labels:** `feature`, `application`

## Descrição
Criar um encaminhamento formal para a rede de serviços (Saúde, Educação, Jurídico).

## Regra Importante
- Validar se o `referredPersonId` (quem está sendo encaminhado) é o paciente OU um membro da família. O domínio já valida (`PAT-003`), o Use Case deve capturar esse erro e retornar adequadamente.

## Critérios de Aceite
- [ ] Use Case implementado.
- [ ] Persistência do Referral no agregado.
- [ ] Evento `ReferralCreated` disparado.
