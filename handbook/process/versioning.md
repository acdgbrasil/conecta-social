# Versionamento e Retrocompatibilidade

## Esquema de versão a partir da 2.0.0
Adotamos quatro números: `MAJOR.MINOR.FEATURE.PATCH`.

- **MAJOR** — alterações incompatíveis (quebram contratos públicos). Só sobe quando encerrarmos um ciclo completo de descontinuação.
- **MINOR** — novas capacidades retrocompatíveis (novas APIs, eventos, agregados opcionais).
- **FEATURE** — incrementado em **todo PR** que altera código, mesmo que seja bugfix. Serve como marcador de rastreabilidade para merges contínuos.
- **PATCH** — correções pequenas liberadas em produção sem novas features (hotfix). Resetado para `0` sempre que `FEATURE` ou `MINOR` mudam.

Exemplo de fluxo:
1. Versão base `2.0.0.0`.
2. Primeiro PR mergeado: `2.0.1.0`.
3. Segundo PR sem quebra: `2.0.2.0`.
4. Hotfix urgente sobre o estado atual: `2.0.2.1`.
5. Entrega relevante agregando comportamento: promover para `2.1.0.0`.

O `FEATURE` garante um identificador incremental por PR, enquanto `PATCH` permite hotfix rápido sem precisar aguardar o próximo merge funcional.

## Processo por PR
1. Atualizar `package.json` na raiz (e em pacotes afetados) com a nova versão seguindo as regras acima.
2. Atualizar changelog (próximo item) antes do merge.
3. Garantir que testes e linters foram executados. Sem suite verde, a versão não é válida.
4. Registrar no PR o resumo da mudança + versão resultante.

## Changelog e documentação
- Manter `reports/daily` ou `reports/refactor` atualizados com notas de decisão relevantes.
- Para mudanças que afetem compatibilidade, adicionar uma seção em `process/retrocompatibilidade.md` (ver abaixo).

## Retrocompatibilidade
1. **Contrato público imutável**: nenhuma API/domain event é removida após publicada. Somente extensão até termos migração segura.
2. **Feature flag / soft deprecation**: ao introduzir alternativa, sinalizar no handbook (process/retrocompatibilidade.md) com prazo e plano de migração.
3. **Teste de regressão obrigatório**: bug corrigido vira teste (`packages/**/tests`). Sem teste, a depreciação não está autorizada.
4. **Janela de convivência**: por padrão, manter recursos antigos convivendo por pelo menos duas versões `MINOR`.

## Próximos artefatos
- `process/retrocompatibilidade.md` (pendente) — tabela com features, estado (ativo/deprecando), data estimada de remoção.
- Script `bun run version <type>` (futuro) para automatizar incremento de versão e atualização do changelog.
