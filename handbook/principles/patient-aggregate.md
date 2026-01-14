# Agregado `Patient`

Derivado das respostas da primeira entrevista (`handbook/ domain_questions/first_interview.md:102`), este documento formaliza o contrato da raiz de agregado que representa o prontuário social.

## Propósito
- Servir como único ponto de entrada para qualquer mutação no prontuário social.
- Encapsular invariantes antes de interagir com ACLs (People, Auth) ou persistência.
- Expor comportamentos na linguagem ubíqua (`assignPrimaryCaregiver`, `reportRightsViolation`, ...), evitando property bags.

## Estado Gerenciado
- Identidade: `id` (Uuid), `personId` (Uuid vinculado ao People Context).
- Value Objects: `Diagnosis`, `SocialHealthSummary`, `HousingCondition`, `SocioeconomicSituation`, `CommunitySupportNetwork` (`handbook/ domain_questions/first_interview.md:114`).
- Coleções de Entidades: `familyMembers`, `appointments`, `referrals`, `violationReports`.

## API Pública (2025-11)
- **Fábricas**: `createFromScratch(personId, diagnoses)` e `createFromObject(id, props)` retornam `Result`.
- **Família**: `addFamilyMember`, `removeFamilyMember`, `assignPrimaryCaregiver`.
- **Encaminhamentos/violações**: `createReferral`, `reportRightsViolation` (ambos validam timestamps e fronteira).
- **Narrativas clínicas**: `registerAppointment`, `updateHousingCondition`, `updateSocioEconomicSituation`, `updateCommunitySupportNetwork`, `updateSocialHealthSummary`.
- **Read-only**: getters expõem snapshots de VO`s ou `ImutableList` sem permitir mutação externa.

## Invariantes do Agregado
- **Diagnóstico inicial obrigatório**: criação exige `ImutableList` não vazia e sem duplicatas.
- **Unicidade de membro**: `addFamilyMember` rejeita `personId` repetido; `removeFamilyMember` erra com `P.FamilyMemberNotFound`.
- **Cuidador principal único**: `assignPrimaryCaregiver` revoga automaticamente o cuidador atual antes de promover o novo.
- **Fronteira**: `createReferral`/`reportRightsViolation` só aceitam `personId` pertencente ao paciente ou membros.
- **Temporalidade**: `ensureTimestamp` cria/valida `Timestamp` e impede datas futuras ou incidentes após o relato.
- **Imutabilidade**: listas são sempre reconstruídas via `ImutableListFactory` e VO`s substituídos, nunca mutados in place.

## Próximos Passos
1. Definir eventos de domínio publicados por cada operação (ex.: `ReferralCreated`, `RightsViolationReported`) e documentar payload/versão.
2. Modelar ACLs para People/Auth antes de ligar o agregado a camadas externas.
3. Expandir testes BDD para fluxos multi-agregado (encaminhamento + agenda) usando os helpers atuais.
4. Registrar alterações que afetem contratos públicos em `process/retrocompatibilidade.md`.
