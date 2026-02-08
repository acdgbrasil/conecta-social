# [TASK-037] Refinar .gitignore (Remover ignorados indevidos)

**Status:** ✅ Done
**Prioridade:** 🟡 Média
**Labels:** `infra`, `fix`
**Origem:** PR #147 review

## Descrição
A entrada em `.gitignore` está muito ampla e ignorando pastas importantes:
1. `handbook/tooling/`: Ignora documentação técnica essencial.
2. `packages/acdg/...`: (Obsoleto) Referência a pacotes que não existem mais neste repo.

## Tarefas
- [x] Remover `handbook/tooling/` do `.gitignore`.
- [x] Limpar referências obsoletas a `packages/`.

## Critérios de Aceite
- [x] Documentação do tooling visível no Git.
- [x] `.gitignore` limpo e sem regras desnecessárias.
