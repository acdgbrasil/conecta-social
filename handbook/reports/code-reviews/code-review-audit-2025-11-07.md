# Code Review — codebase-audit (07/11/2025)

## Visão geral
- Revisão abrangente do canal atual (`shared` + `social-care`) para alinhar documentação e identificar riscos antes do versionamento `0.1.0`.
- Suites `bun test` verdes; os achados abaixo focam em regressões silenciosas ou inconsistências não cobertas pelos testes.

## Achados principais
| Id | Tipo | Severidade | Descrição |
| --- | --- | --- | --- |
| **CR-01** | bug | high | `SocialBenefit.copyWith` lança `unwrap()` em erros e importa de `src`, quebrando o contrato de `Result`. |
| **CR-02** | bug | medium | `SocialBenefitsCollection.create` não valida `null/undefined` e depende de import profundo (`from "src"`). |
| **CR-03** | domain | medium | Catálogo `ELETRICITY_ACCESS` usa valores de abastecimento de água, divergindo do domínio e dos testes. |

## Detalhes dos achados

### CR-01 — `SocialBenefit.copyWith` não é `Result`-safe
- **Arquivo**: `packages/social/social-care/value-objects/SocialBenefit.valueObject.ts:6-28`.
- **Problema**: 
  - `FamilyMemberId.create(...)` é chamado duas vezes; quando inválido, `beneficiaryId` vira `Result.err` e o `unwrap()` da linha 27 lança ao invés de retornar `Result.err`.
  - Import `from "src"` foge da superfície pública e quebra ao publicar o pacote.
- **Impacto**: qualquer fluxo que tente atualizar o beneficiário com ID inválido derruba a aplicação sem chance de capturar o erro; bundlers externos falharão porque `src` não existe no pacote publicado.
- **Correções sugeridas**:
  1. Guardar o `Result` uma única vez:
     ```ts
     const candidate = FamilyMemberId.create(safeBeneficiaryId);
     if (candidate.isErr) return err(BE.BeneficiaryIdInvalid({ beneficiaryId: safeBeneficiaryId }));
     ```
  2. Remover o import de `src` e usar `@conecta/option`/`@conecta/fn`.
  3. Adicionar teste RED em `tests/regression` garantindo que `copyWith` retorna `Result.err` sem lançar.

### CR-02 — `SocialBenefitsCollection` não defende entrada nula
- **Arquivo**: `packages/social/social-care/value-objects/SocialBenefitsCollection.valueObject.ts:1-41`.
- **Problema**:
  - O método `create` assume `benefits` como array e chama `.length` imediatamente; `null`/`undefined` explode com `TypeError`.
  - Importa `ImutableListFactory` de `src`, contrariando a política de barrels públicos.
- **Impacto**: reconstruções de `SocioEconomicSituation` com `receivesSocialBenefit=false` podem quebrar ao tentar copiar uma coleção nula. Integrações externas não conseguirão resolver `src`.
- **Correções**:
  - Validar entrada: `if (!Array.isArray(benefits)) return err(SBC.InvalidSource({ input: benefits }))`.
  - Ajustar import para `@conecta/fn`.
  - Criar teste RED cobrindo `create(null as any)` e `copyWith({ items: undefined })`.

### CR-03 — Catálogo de eletricidade inconsistente
- **Arquivo**: `packages/social/social-care/value-objects/props/housingCondition.props.ts:1-6`.
- **Problema**: `ELETRICITY_ACCESS` lista `WELL_SPRING`, `RAINWATER_HARVESTING`, `WATER_TRUCK`, que são fontes de água; não existem opções reais de energia (rede, gerador, solar).
- **Impacto**: UI/relatórios exibem rótulos errados e os testes precisam fazer gambiarras (ver comentário em `patient.aggregate.spec.ts`) para montar um VO válido.
- **Ação sugerida**: substituir pelos valores corretos (`GRID_CONNECTION`, `GENERATOR`, `SOLAR`, `NO_ACCESS`), atualizar `HousingCondition` tests e registrar a mudança em `process/retrocompatibilidade.md` se houver consumidores externos.

## Follow-ups
1. Abrir PR corrigindo os três itens acima + adicionar regressões sugeridas.
2. Rodar `bun test packages/social/social-care/tests` após ajustes e anexar saída ao relatório diário.
3. Atualizar `handbook/quality/quality-plan.md` com o status das correções assim que os testes cobrirem os novos cenários.
