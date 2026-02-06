# Review de Qualidade - Social Care Domain

**Status:** 🟡 Action Needed
**Prioridade:** 🔥 Alta

Achados (ordenados por severidade)

Alto
- src/modules/social-care/domain/entities/Patient.entity.ts:243 | Motivo: mutacoes relevantes (removeFamilyMember, assignPrimaryCaregiver, updateHousingCondition, updateSocioEconomicSituation) nao incrementam version nem registram eventos, o que pode quebrar concorrencia otimista, auditoria e ordenacao de eventos do agregado. | Capitulo: "The Code Review Pyramid".

Medio
- src/modules/social-care/domain/entities/Patient.entity.ts:7, src/modules/social-care/domain/value-objects/personId.valueObject.ts:1, src/modules/social-care/domain/value-objects/FamilyMemberId.valueObject.ts:1, src/modules/social-care/domain/value-objects/timestamp.valueObject.ts:1 | Motivo: dominio depende de adapters (systemClock/uuidV7Provider), acoplando infraestrutura e violando DIP; ideal injetar portas a partir da camada de aplicacao. | Capitulo: "CAP, BASE, SOLID, KISS, What do these acronyms mean?" (SOLID/DIP).
- src/modules/social-care/domain/services/patient-boundary.service.ts:7 | Motivo: mistura Uuid com PersonId e compara por string, reduzindo type-safety e podendo aceitar IDs errados; prefira PersonId/FamilyMemberId ou conversao explicita com equals. | Capitulo: "CAP, BASE, SOLID, KISS, What do these acronyms mean?" (KISS/SRP).
- src/modules/social-care/domain/value-objects/SocialBenefit.valueObject.ts:9 | Motivo: beneficiaryId e armazenado como string e copyWith usa unSafe; perde invariantes do value object e complica validacao. Sugestao: armazenar FamilyMemberId e expor getters tipados. | Capitulo: "CAP, BASE, SOLID, KISS, What do these acronyms mean?" (KISS).
- src/modules/social-care/domain/entities/Referral.entity.ts:10, src/modules/social-care/domain/entities/SocialCareAppointment.entity.ts:8 | Motivo: campos livres (destinationService, type) nao possuem validacao de dominio/enum, abrindo margem para dados invalidos; centralizar validacao e enums. | Capitulo: "Top 12 Tips for API Security" (Input Validation).

Baixo
- src/modules/social-care/domain/value-objects/socioEconomicSituation.valueObject.ts:62 | Motivo: dupla instanciacao (new SocioEconomicSituation(...)) antes de retornar; remove clareza e custo extra. | Capitulo: "CAP, BASE, SOLID, KISS, What do these acronyms mean?" (KISS).
- src/modules/social-care/domain/value-objects/SocialBenefitsCollection.valueObject.ts:1 | Motivo: import ImutableListFactory nao usado e ausencia de validacao de itens nulos; manter higienizacao simples melhora legibilidade. | Capitulo: "CAP, BASE, SOLID, KISS, What do these acronyms mean?" (KISS).
- src/modules/social-care/domain/value-objects/socialHealthSummary.valueObject.ts:7 | Motivo: typo em hasRelevantDrugTheapy propaga para API e testes; considerar alias/renomeacao controlada. | Capitulo: "CAP, BASE, SOLID, KISS, What do these acronyms mean?" (KISS).

Perguntas / Assuncoes
- O agregado Patient e versionado para concorrencia otimista? Se sim, toda mutacao deve incrementar version e idealmente emitir evento.
- Os IDs de pessoas devem ser sempre PersonId (UUIDv7) ou existe intencionalmente um mix com Uuid generico?

Riscos e Lacunas de Teste
- Faltam testes que garantam incremento de version e geracao de eventos para updateHousingCondition, updateSocioEconomicSituation, removeFamilyMember e assignPrimaryCaregiver. | Capitulo: "Best ways to test system functionality".
- Faltam testes cobrindo validacao de destinationService e type com enums/values proibidos. | Capitulo: "Best ways to test system functionality".
