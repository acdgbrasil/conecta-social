# Plano de Qualidade — 07/11/2025

## 1. Estado atual da suíte
- Comando executado: `bun test` (raiz do monorepo).
- Resultado: **verde** (shared kernel + social-care). Todas as suites unit/regression passaram.
- Evidência registrada em `reports/daily/daily-report-2025-11-07.md` (ver seção 3 abaixo).

## 2. Riscos e lacunas identificados
1. **Cobertura parcial de erros nos VO`s financeiros**
   - `SocialBenefit.copyWith` lança `unwrap()` em caso de `FamilyMemberId` inválido, mas não há teste cobrindo o cenário (arquivo `packages/conecta-raros/social-care/domain/value-objects/SocialBenefit.valueObject.ts`).
   - `SocialBenefitsCollection.create` aceita apenas arrays, porém não valida `null/undefined`; precisamos de regressão dedicada.
2. **Constantes inconsistentes**
   - `ELETRICITY_ACCESS` ainda lista valores de acesso à água (`WELL_SPRING`, `RAINWATER_HARVESTING`). Não há teste garantindo catálogo correto.
3. **Imports profundos/errados**
   - Dois VO`s importam `src` diretamente (`SocialBenefit.valueObject.ts`, `SocialBenefitsCollection.valueObject.ts`). Falhas de configuração podem passar despercebidas sem teste.

## 3. Roteiro imediato
1. **Adicionar regressões RED**
   - `packages/conecta-raros/social-care/domain/tests/regression/social-benefits.red.spec.ts` cobrindo:
     - `SocialBenefit.copyWith` com `beneficiaryId` inválido não deve lançar.
     - `SocialBenefitsCollection.create(null as any)` retorna `Result.err`.
   - Testes para catálogos (`housingCondition.props.spec.ts`) assegurando que `ELETRICITY_ACCESS` contém apenas valores elétricos.
2. **Corrigir imports**
   - Trocar `from "src"` por `@conecta/fn`/`@conecta/option` nos VO`s citados e garantir que o linter capture regressões.
3. **Automação**
   - Configurar job de CI local (script `bun test --reporter=junit`) e anexar o XML em `coverage/` para futuras leituras.

## 4. Checklist antes de liberar nova versão
- [ ] `bun test` verde e registrado no relatório diário.
- [ ] Novos testes cobrindo bugs encontrados.
- [ ] Lint/Typecheck (`bun run lint`, `bun run typecheck` quando disponíveis).
- [ ] Handbook sincronizado (`handbook/codebase/**`, `process/retrocompatibilidade.md`).
- [ ] Changelog atualizado conforme `handbook/process/versioning.md`.
