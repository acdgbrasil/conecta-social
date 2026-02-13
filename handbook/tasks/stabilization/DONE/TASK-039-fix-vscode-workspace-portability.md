# [TASK-039] Ajustar Portabilidade dos Arquivos do VSCode

**Status:** 🟢 Done
**Prioridade:** 🟡 Média
**Labels:** `dx`, `tooling`, `vscode`
**Origem:** PR #148 review (Copilot)

## Descrição
A revisão identificou configurações de VSCode acopladas a máquina/workspace específico, o que pode quebrar setup de outros colaboradores.

## Comentários Relacionados (PR #148)
- `.vscode/settings.json`:
  - https://github.com/acdgbrasil/conecta-social/pull/148#discussion_r2777198805
- `.vscode/launch.json`:
  - https://github.com/acdgbrasil/conecta-social/pull/148#discussion_r2777198809

## Tarefas
- [x] Remover caminhos absolutos específicos de usuário em `.vscode/settings.json`.
- [x] Trocar `cwd` em `.vscode/launch.json` para `${workspaceFolder}` (ou alternativa portátil equivalente).
- [x] Documentar no handbook quais configurações devem ser locais (não versionadas).

## Critérios de Aceite
- [x] Nenhum caminho absoluto de usuário nos arquivos versionados de VSCode.
- [x] Launch configs funcionam com nome de workspace diferente.

## Evidências
- Arquivos `.vscode/settings.json` e `.vscode/launch.json` atualizados com caminhos portáteis.
- Documentação criada em `handbook/tooling/vscode/README.md`.
