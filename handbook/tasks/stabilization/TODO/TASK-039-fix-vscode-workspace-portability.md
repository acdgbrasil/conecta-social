# [TASK-039] Ajustar Portabilidade dos Arquivos do VSCode

**Status:** 🔴 To Do
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
- [ ] Remover caminhos absolutos específicos de usuário em `.vscode/settings.json`.
- [ ] Trocar `cwd` em `.vscode/launch.json` para `${workspaceFolder}` (ou alternativa portátil equivalente).
- [ ] Documentar no handbook quais configurações devem ser locais (não versionadas).

## Critérios de Aceite
- [ ] Nenhum caminho absoluto de usuário nos arquivos versionados de VSCode.
- [ ] Launch configs funcionam com nome de workspace diferente.
