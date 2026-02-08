# Review de Qualidade - Social Care Domain

**Status:** 🟡 In Progress (maioria endereçada via Refatoração FP)
**Prioridade:** 🔥 Alta

## Resumo das Ações (07/02/2026)
A grande refatoração para o modelo funcional (TASK-029 a TASK-032) endereçou automaticamente a maioria dos achados críticos deste review:

1.  **Versão e Eventos (Severidade Alta):** Resolvido pela integração com `Aggregate<T>`. Agora, todas as funções de mutação (`addFamilyMember`, `assignPrimaryCaregiver`, etc.) passam obrigatoriamente por `Aggregate.update`, que incrementa a versão e permite anexar eventos de forma atômica e imutável.
2.  **Violação de DIP (Severidade Média):** Removidas as dependências de `systemClock` e `uuidV7Provider` de dentro das entidades e VOs. As funções agora recebem valores puros (ex: `now: Date`) resolvidos pela camada de Aplicação.
3.  **Type-Safety nos IDs (Severidade Média):** Adicionado uso de `Branded Types` para `PersonId`, `FamilyMemberId` e `Uuid`, eliminando a confusão entre strings puras e IDs validados.
4.  **Invariantes de VO (Severidade Média):** Refatorados VOs como `SocialBenefit` e `HousingCondition` para garantir validação estrita no `create` funcional, sem brechas para `unSafe` ou estados parciais.

## Itens Pendentes (Acompanhamento)
- [ ] Validar campos livres (`destinationService`, `type`) com enums reais nas entidades `Referral` e `SocialCareAppointment` (Melhoria de UX/Segurança).
- [ ] Renomear typo `hasRelevantDrugTheapy` (para `Therapy`) no `socialHealthSummary`.

---
Achados Originais (Histórico)...
