# [TASK-045] Alinhamento de Mapeamento e Persistência (Domínio)

**Status:** ✅ Done
**Prioridade:** 💎 Crítica
**Labels:** `arch`, `domain`, `persistence`, `stabilization`
**Origem:** Derivadas do PR #193 (`PR193-TODO-03`, `04`)

## Descrição
Corrigir o `PatientMapper` para respeitar a reconstituição do Agregado via Value Objects e alinhar o adapter de persistência ao contrato do domínio.

## Tarefas
- [ ] Corrigir `PatientMapper`: serialização/desserialização JSON, uso de `Option`, `PersonId`, `reconstitute`, remoção de `any` e tipagem explícita.
- [ ] Alinhar `patient.persistence.adapter` ao contrato: `PersonId` em assinaturas, erro de not found canônico e fluxo de domain events/outbox.

## Critérios de Aceite
- [ ] Zero `any` no Mapper de persistência.
- [ ] Reconstituição do Agregado validada em testes unitários.
