# [TASK-026] Refinar .gitignore (Remover ignorados indevidos)

**Status:** 🔴 To Do
**Prioridade:** 🟡 Média
**Labels:** `infra`, `fix`
**Origem:** PR #147 review

## Descrição
A entrada em `.gitignore` está muito ampla e ignorando pastas importantes:
1. `handbook/tooling/`: Ignora documentação técnica essencial.
2. `packages/acdg/...`: (Obsoleto) Referência a pacotes que não existem mais neste repo.

## Tarefas
- [ ] Remover `handbook/tooling/` do `.gitignore`.
- [ ] Limpar referências obsoletas a `packages/`.

## Critérios de Aceite
- [ ] Documentação do tooling visível no Git.
- [ ] `.gitignore` limpo e sem regras desnecessárias.
