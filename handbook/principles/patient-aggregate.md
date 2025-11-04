# Agregado `Patient`

Derivado das respostas da primeira entrevista (`handbook/ domain_questions/first_interview.md:102`), este documento formaliza o contrato da raiz de agregado que representa o prontuário social.

## Propósito
- Único ponto de entrada para qualquer mutação no prontuário social (`handbook/ domain_questions/first_interview.md:105`).
- Garante invariantes de negócio que atravessam múltiplos objetos do agregado antes de publicar eventos ou persistir.
- Expõe comportamentos com nomes orientados ao domínio, evitando setters anêmicos.

## Estado Gerenciado
- Identidade: `id` (Uuid), `personId` (Uuid vinculado ao People Context).
- Value Objects: `Diagnosis`, `SocialHealthSummary`, `HousingCondition`, `SocioeconomicSituation`, `CommunitySupportNetwork` (`handbook/ domain_questions/first_interview.md:114`).
- Coleções de Entidades: `familyMembers`, `appointments`, `referrals`, `violationReports`.

## API Pública (Comportamentos)
- Fábrica: `Patient.create(props, personId, diagnosis)` (`handbook/ domain_questions/first_interview.md:126`).
- Atualizações de VOs: `updateHousingCondition`, `updateSocioeconomicSituation`, `updateCommunitySupportNetwork`, `updateSocialHealthSummary` (todos substituem a instância inteira, preservando imutabilidade).
- Operações sobre entidades internas:
  - `addFamilyMember`, `removeFamilyMember`, `assignPrimaryCaregiver`.
  - `registerAppointment`.
  - `createReferral`, `updateReferralStatus`.
  - `reportRightsViolation`, `updateRightsViolationActions`.

## Invariantes do Agregado
- **Unicidade de membro**: `addFamilyMember` rejeita pessoas duplicadas (`handbook/ domain_questions/first_interview.md:137`).
- **Cuidador principal único**: `assignPrimaryCaregiver` revoga o cuidador anterior antes de promover o novo (`handbook/ domain_questions/first_interview.md:139`).
- **Fronteira referencial**: `createReferral` e `reportRightsViolation` aceitam apenas IDs pertencentes ao agregado (`handbook/ domain_questions/first_interview.md:145`).
- **Imutabilidade de VOs**: atualizações substituem instâncias já validadas pelo respectivo `create`.

## Próximos Passos
1. Implementar os métodos ainda pendentes com base nesta especificação (`createReferral`, `reportRightsViolation`, etc.).
2. Definir eventos de domínio correspondentes (ex.: `ReferralCreated`, `RightsViolationReported`) e documentar versões/payloads.
3. Criar suites BDD/TDD que cubram cada invariante antes de codificar.
4. Registrar quaisquer alternativas retrocompatíveis na matriz (`handbook/process/retrocompatibilidade.md`).
