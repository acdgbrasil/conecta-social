# Relatório Diário — 31/10/2025

## Visão geral
- Removido o pacote legado completo (`packages/legacy/**`), incluindo scripts (`bin/legacy.sh`), lockfile antigo (`bun.lock`) e artefatos de documentação/testes, consolidando o monorepo no novo modelo 1.5.
- Novo `bunfig.toml` com aliases `@conecta/*` e configuração de cobertura para o runner do Bun.
- `tsconfig.json` reescrito para refletir apenas os pacotes ativos, compartilhar aliases e incluir as tipagens locais do runner em `types/bun-test.d.ts`.
- `src/index.ts`, `packages/shared/index.ts` e `packages/social/social-care/index.ts` agora formam a superfície oficial de exports, dispensando shims do legado.

## Evolução do domínio
- Valorizações do domínio descritas em `refactor-report/05-domain-purity-refactor.md` foram aplicadas: VO `Diagnosis` agora injeta `Timestamp`, o `SocialBenefitsCollection` concentra regras de listas de benefícios e `FamilyMemberId` garante UUID v7 válido.
- Pacote `@conecta/uuid` reconstruído de funções avulsas para a classe imutável `Uuid`, com validações e geração v7 determinista (`packages/shared/uuid-pattern/uuid.ts`).
- Novos catálogos de erro alinhados ao padrão de fábrica (`packages/social/social-care/err/*.ts`), incluindo `FamilyMember`, `Referral`, `SocialCareAppointment` e `RightsViolationReport`.
- Entidades centrais do agregado `Patient` modeladas ou revisitadas:
  - `FamilyMember` aplica validações de vínculo e primariedade.
  - `SocialCareAppointment` checa datas, resumo/plano de ação e limites de caracteres.
  - `Referral` gerencia transições `PENDING -> COMPLETED/CANCELLED` com guarda de estado.
  - `RightsViolationReport` valida cronologia, descrição e catálogo padronizado de tipos (`ViolationType`).

## Tooling e DX
- `.eslintignore`, `eslint.config.mjs` e `gitleaks.toml` perderam exceções específicas do legado, mantendo apenas ignorados essenciais.
- Documentação de migração atualizada (`MIGRATION_NOTES.md`) para refletir a árvore minimalista focada em `packages/shared` e `packages/social/social-care`.
- Tipagem mínima do runner (`types/bun-test.d.ts`) garante IntelliSense e build sem necessidade de `bun-types`.
- Auditoria de domínio consolidada em `audition.md`, funcionando como checklist de conformidade DDD/Clean Code para o contexto Social Care.

## Relatórios de refatoração consultados
- `refactor-report/05-domain-purity-refactor.md`: registra a obtenção de pureza do domínio, abstração de dependências e padronização dos VOs.
- `refactor-report/06-legacy-drop-and-bun-aliases.md`: documenta a exclusão do legacy, adoção de Bun + aliases e estabilização da surface pública.

## Testes e cobertura
- Execução de `bun test --coverage` em ambiente restrito gerou arquivos `coverage/lcov.info` e `.tmp` auxiliares; thresholds de 85% definidos, mas geração completa exige permissão de escrita fora do sandbox.
- Testes de VOs permanecem verdes; suites de entidades (`packages/social/social-care/entities/__tests__`) intencionalmente falham até que as implementações sejam concluídas, conforme anotado no relatório 06.

