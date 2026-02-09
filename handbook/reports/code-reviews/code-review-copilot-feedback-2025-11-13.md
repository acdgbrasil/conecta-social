# Code Review — Copilot feedback (13/11/2025)

## Contexto
Analisamos os 9 comentários automáticos feitos pelo Copilot no PR que consolida documentação, novos VOs e correções de regressão do pacote `social-care`. O objetivo deste relatório é traduzir cada apontamento em ações concretas para o time.

## Resumo rápido
| Id | Arquivo | Tipo | Severidade | Síntese |
| --- | --- | --- | --- | --- |
| CR-01 | `value-objects/SocialBenefit.valueObject.ts` | bug | alta | `copyWith` usa imports internos (`"src"`) e trata `Result` de forma insegura. |
| CR-02 | `err/ICDCode.error.ts` | breaking-risk | média | Regex de placeholders ficou mais restritiva; precisa garantir que nenhum template usa `{0foo}`. |
| CR-03 | `tests/unit/value-objects/SocialBenefitsCollection.valueObject.spec.ts` | style | baixa | Falta `;` após a constante `internId`; manter consistência do estilo. |
| CR-04 | `shared/fn-pattern/imutable-list.ts` | docs/perf | média | `hasDuplicates`/`stableStringify` precisam de documentação e nota sobre custo; eventualmente otimizar. |
| CR-05 | `value-objects/CommunitySupportNetwork.valueObject.ts` | domain | baixa | Limite mágico `300` para `familyConflicts`; extrair constante nomeada. |
| CR-06 | `value-objects/SocialBenefitsCollection.valueObject.ts` | domain | média | Mensagem de duplicidade sempre cita o primeiro benefício, mesmo quando outro é o duplicado. |
| CR-07 | `tests/unit/value-objects/socioEconomicSituation.valueObject.spec.ts` | hygiene | baixa | Import de `Uuid` ficou órfão após migração para `FamilyMemberId`. |
| CR-08 | `value-objects/SocialBenefit.valueObject.ts` | hygiene | baixa | Imports `None/Some` não usados. |

## Detalhamento dos achados

### CR-01 — `SocialBenefit.copyWith` não é `Result`-safe e usa barrel incorreto
- **Trecho**: `packages/social/social-care/value-objects/SocialBenefit.valueObject.ts:6-32`.
- **Problema**: importa `None/Some` de `"src"` e `unSafe` diretamente do módulo interno, o que quebra quando o pacote é publicado (não existe `src`). Além disso, cria um `Result` para `FamilyMemberId` duas vezes e faz `unwrap()` mesmo em caminhos de erro, permitindo throws em vez de retornar `Result.err`.
- **Ação sugerida**:
  1. Trocar os imports para os barrels públicos (`@conecta/option` ou `@conecta/shared/option-pattern`).
  2. Refatorar `copyWith` para calcular o novo `beneficiaryId` uma única vez e retornar `err(BE.BeneficiaryIdInvalid(...))` sem `unwrap`.
  3. Adicionar testes cobrindo IDs inválidos para garantir que o método nunca lança.

### CR-02 — Regex de placeholders pode quebrar templates existentes
- **Trecho**: `packages/social/social-care/err/ICDCode.error.ts:18`.
- **Mudança**: `/\{([a-zA-Z0-9_]+)\}/g` → `/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g`.
- **Motivação**: evitar placeholders iniciados por número, o que deixa o template mais alinhado a identificadores TypeScript.
- **Risco**: se algum template atual usar algo como `{0field}`, a interpolação vai parar de funcionar silenciosamente.
- **Ação sugerida**: varrer `ICDError.catalog` (e demais catálogos reutilizando `template`) para garantir que nenhum placeholder começa com dígito. Registrar resultado no PR (ou adicionar teste que falhe caso isso ocorra).

### CR-03 — Consistência de estilo no teste de SocialBenefitsCollection
- **Trecho**: `packages/social/social-care/tests/unit/value-objects/SocialBenefitsCollection.valueObject.spec.ts:5`.
- **Problema**: constante `internId` sem `;`. Apesar do ASI, o padrão do repositório é terminar declarações com ponto e vírgula.
- **Ação**: acrescentar o `;` para evitar ruído em reviews futuros.

### CR-04 — Documentação & performance de `ImutableList.hasDuplicates`
- **Trechos**: `packages/shared/fn-pattern/imutable-list.ts:19-69`.
- **Problemas**:
  - Falta qualquer comentário explicando que a detecção de duplicados usa serialização determinística (`stableStringify`), que lida com referências circulares e depende da ordem das chaves.
  - `stableStringify` serializa cada item, ordena chaves e trata ciclos em toda chamada, o que pode custar caro em listas grandes.
- **Ações sugeridas**:
  1. Adicionar JSDoc antes de `hasDuplicates` resumindo a estratégia, a noção de igualdade (estrutural) e o custo aproximado (`O(n * m)`).
  2. Documentar `stableStringify` mencionando impacto em performance e possíveis otimizações (cache por referência, fast-path para primitivos). Não é obrigatório otimizar agora, mas precisamos sinalizar a preocupação.

### CR-05 — Limite mágico para `familyConflicts`
- **Trecho**: `packages/social/social-care/value-objects/CommunitySupportNetwork.valueObject.ts:26-34`.
- **Problema**: o tamanho máximo de 300 caracteres aparece inline. Caso o requisito mude, temos que caçar esse número manualmente.
- **Ação**: definir `const MAX_FAMILY_CONFLICTS_LENGTH = 300;` próximo ao topo do arquivo e usar a constante nas validações.

### CR-06 — Mensagem de duplicidade aponta para o item errado
- **Trecho**: `packages/social/social-care/value-objects/SocialBenefitsCollection.valueObject.ts:27-33`.
- **Problema**: ao detectar duplicados com `hasDuplicates()`, o erro sempre chama `SBC.DuplicateBenefitNotAllowed(benefits[0].benefitName)`. Se o item duplicado for o segundo ou terceiro, a mensagem acusa o benefício errado.
- **Ações possíveis**:
  1. Ao detectar `hasDuplicates`, iterar novamente guardando um conjunto (`seen`) com uma chave determinística (ex.: `benefitName + beneficiaryId`) e retornar o nome correto assim que achar a repetição.
  2. Alternativamente, ajustar o template para não citar nenhum nome específico.
- **Recomendação**: seguir opção (1) para preservar o feedback específico ao usuário.

### CR-07 — Import não utilizado em `socioEconomicSituation.valueObject.spec.ts`
- **Trecho**: `packages/social/social-care/tests/unit/value-objects/socioEconomicSituation.valueObject.spec.ts:1-4`.
- **Problema**: depois de migrar para `FamilyMemberId`, o import de `Uuid` ficou órfão.
- **Ação**: remover o import e garantir que `VALID_UUID` continue vindo de `FamilyMemberId.create(...)`.

### CR-08 — Imports `None/Some` não utilizados
- **Trecho**: `packages/social/social-care/value-objects/SocialBenefit.valueObject.ts:6`.
- **Problema**: depois da refatoração, `None` e `Some` não são mais usados (restou apenas o `unSafe`).
- **Ação**: apagar os imports mortos para manter o arquivo enxuto e evitar confusões sobre dependências obrigatórias.

## Próximos passos recomendados
1. Endereçar CR-01 e CR-06 primeiro (afetem regras de negócio diretamente); abrir testes RED nos respectivos arquivos.
2. Na sequência, resolver itens de higiene (CR-03, CR-07, CR-08) e documentação (CR-04, CR-05) no mesmo PR para evitar rodadas extras de review.
3. Validar os catálogos após CR-02 com um `rg '{[0-9]'` na pasta `err/` para garantir que nenhum placeholder começa com dígito, anexando o resultado no PR.
4. Atualizar este relatório quando os itens forem fechados, citando commits/PRs correspondentes.

---

## Atualização — execução de 14/11/2025

| Id | Status | Evidência |
| --- | --- | --- |
| CR-01 | ✅ Ajustado | `packages/social/social-care/value-objects/SocialBenefit.valueObject.ts` usa `@conecta/option`, valida beneficiaryId uma única vez e os testes `socialBenefits.valueObject.spec.ts` cobrem regressões. |
| CR-02 | ✅ Validado | `rg -Pn '(?<!\\)\\{[0-9]' packages/social/social-care/err` não encontrou placeholders iniciando com dígito. Registrar o comando no PR. |
| CR-03 | ✅ Ajustado | `packages/social/social-care/tests/unit/value-objects/SocialBenefitsCollection.valueObject.spec.ts:5` agora termina a declaração com `;`. |
| CR-04 | ✅ Documentado / ⚠️ melhoria futura | Comentários adicionados em `packages/shared/fn-pattern/imutable-list.ts` e plano detalhado em `handbook/reports/perf/imutable-list-hasDuplicates.md` para tratar performance quando houver bandwidth. |
| CR-05 | ✅ Ajustado | Limite virou `MAX_FAMILY_CONFLICTS_LENGTH` em `CommunitySupportNetwork.valueObject.ts`. |
| CR-06 | ✅ Ajustado | `SocialBenefitsCollection.create` usa `findDuplicates` para apontar o benefício correto; teste RED incluído em `SocialBenefitsCollection.valueObject.spec.ts`. |
| CR-07 | ✅ Ajustado | Import órfão removido de `socioEconomicSituation.valueObject.spec.ts`. |
| CR-08 | ✅ Ajustado | VO de benefício e `socialHealthSummary` agora importam apenas `unSafe` via barrel; `@conecta/option` re-exporta a função. |

### Testes
- `bun test` (ver saída no terminal) — todos os specs verdes após as correções.

### Itens mapeados para futuro
- Otimização/benchmark de `ImutableList.hasDuplicates` descrita em `handbook/reports/perf/imutable-list-hasDuplicates.md`. Sem ação adicional neste PR.
