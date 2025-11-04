# Context Map — Conecta Social

Este mapa consolida os limites de domínio descritos na primeira entrevista (`handbook/ domain_questions/first_interview.md`) para orientar novas features no monorepo.

## Contextos Atuais
- **Social Care Context (Core Domain)** — `packages/social/social-care/`; concentra entidades e VOs ricos (`Patient`, `RightsViolationReport`, `SocialHealthSummary`) (`handbook/ domain_questions/first_interview.md:15`).
- **Shared Kernel Context** — `packages/shared/`; provê utilitários genéricos (`Result`, `DomainError`, `Uuid`, `Option`) partilhados pelos demais contextos (`handbook/ domain_questions/first_interview.md:17`).

## Contextos Emergentes
- **People Context (cadastro de pessoas)** — responsável por identificar pacientes e membros da família; será acessado via ACL para garantir existência e dados básicos (`handbook/ domain_questions/first_interview.md:34`).
- **Identity & Access Context** — valida permissões de profissionais antes de ações críticas (`handbook/ domain_questions/first_interview.md:39`).
- **Analysis & Research Context (Conecta Raros)** — consome eventos de domínio publicados pelo Social Care, aplicando anonimização antes de análises (`handbook/ domain_questions/first_interview.md:44`).

## Relações Entre Contextos
- **Social Care ↔ People** — relação *Customer/Supplier* com ACL no lado Social Care para tradução de dados de pessoa (`handbook/ domain_questions/first_interview.md:34`).
- **Social Care ← Identity & Access** — relação *Conformist/Open Host Service*; Social Care consulta permissões de execução (`handbook/ domain_questions/first_interview.md:39`).
- **Social Care → Analysis & Research** — relação *Published Language* via eventos de domínio com ACL consumidor que anonimiza payloads (`handbook/ domain_questions/first_interview.md:44`).
- **Shared Kernel ↔ Demais Contextos** — relação *Shared Kernel*; qualquer mudança exige coordenação entre times (`handbook/ domain_questions/first_interview.md:17`).

## Invariantes de Agregados (Social Care)
- VOs aplicam autovalidação (`Diagnosis`, `HousingCondition`, `SocioeconomicSituation`, `RightsViolationReport`, `SocialCareAppointment`) (`handbook/ domain_questions/first_interview.md:47`).
- Raiz `Patient` garante unicidade de cuidador principal, integridade referencial de membros e encaminhamentos, e validação de vítimas em relatórios (`handbook/ domain_questions/first_interview.md:53`).

## Padrões de Integração
- **ACL SUAS** — traduz formulários do Prontuário SUAS para o agregado `Patient` e vice-versa (`handbook/ domain_questions/first_interview.md:63`).
- **ACL Diagnóstico** — isola sistemas de saúde externos ao fornecer icdCodes limpos (`handbook/ domain_questions/first_interview.md:70`).
- **Repositórios Persistência** — atuam como ACL para banco de dados, mantendo domínio agnóstico (`handbook/ domain_questions/first_interview.md:73`).

## Estrutura de Times
- **Social Care Team** — proprietário do Core Domain; rituals imersos na linguagem ubíqua (`handbook/ domain_questions/first_interview.md:83`).
- **Platform Team** — mantém Shared Kernel e Identity & Access como fornecedores internos (`handbook/ domain_questions/first_interview.md:90`).
- **Data & Analysis Team** — consumidores downstream que definem contratos de eventos e pipelines de anonimização (`handbook/ domain_questions/first_interview.md:96`).

## Próximas Ações
1. Mapear eventos de domínio para cada interação identificada (ex.: `RightsViolationReported`, `ReferralCreated`).
2. Documentar contratos e estruturas de payload no handbook (`process/retrocompatibilidade.md`) quando forem publicados.
3. Desenhar ACLs iniciais (SUAS, Diagnóstico, Auth) definindo DTOs de entrada/saída e testes BDD correspondentes.
4. Revisitar barrels/export surface de cada contexto para garantir isolamento físico entre limites.
