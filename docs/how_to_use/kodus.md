# How to Use Kodus for Conecta Social

Kodus atua como a segunda camada de code review. Ele deve ser mais rigoroso que o Copilot, verificando conformidade com o handbook, garantia de testes e retrocompatibilidade antes de qualquer aprovação.

## 1. Preparação
- Leia o handbook (principalmente `handbook/README.md`, `handbook/process/versioning.md`, `handbook/principles/testing-and-domain.md`, `handbook/principles/patient-aggregate.md`).
- Tenha Bun instalado e exporte `BUN_INSTALL` para que o runtime do VS Code resolva `bun-types`.
- Garanta que o repositório está sem `node_modules`; toda dependência deve ser controlada via `bun.lock`.

## 2. Checklist de Revisão
1. **Estrutura & Importações**
   - Verificar se os arquivos respeitam o layout DDD (domínio não importa infra).
   - Confirmar uso de aliases (`@conecta/*`) e ausência de caminhos relativos quebrando boundaries.
2. **Versionamento & Docs**
   - Assegurar que `package.json` (e pacotes afetados) receberam bump `MAJOR.MINOR.FEATURE.PATCH`.
   - Conferir se o handbook foi atualizado quando há mudanças de domínio/processo.
   - Retrocompatibilidade documentada em `handbook/process/retrocompatibilidade.md`.
3. **Testes**
   - Validar se novas lógicas têm testes em `packages/<context>/tests/{unit,regression}`.
   - Exigir cenário RED para correções de bug e GREEN após ajuste.
4. **Imutabilidade**
   - Garantir que VOs/entidades usam `Result`, `copyWith`, `ImutableListFactory` sem mutações diretas.
5. **Scripts Bun**
   - Nenhum comando `npm`/`yarn`. Apenas `bun test`, `bun run`, etc.
6. **Outputs & Artefatos**
   - Cobertura temporária (`coverage/`) e `bun-test.xml` não devem ser commitados.
7. **Infra/Config**
   - Alterações em `.vscode` e `.github` devem refletir as convenções do handbook e não reintroduzir toolings legadas.

## 3. Ações Automáticas Recomendadas
- Rodar `bun test --filter "<context>"` para suites alteradas.
- Rodar `bun test packages/social/social-care/tests/regression` sempre que invariantes forem tocadas.
- Rodar `bun install --frozen-lockfile` se alguma dependência mudou (espera-se que `bun.lock` esteja atualizado).
- Verificar formatação com `bun fmt` (quando disponível) ou lint conforme scripts existentes.

## 4. Decisão de Aprovação
Aprovar apenas se:
- Versão e documentação estiverem coerentes.
- Todos os testes relevantes passarem em Bun.
- Não existirem violações de DDD/retrocompatibilidade.
- O handbook refletir as mudanças.

Caso qualquer item falhe, pedir ajustes com mensagens objetivas apontando arquivos (use formato `path:line`).
