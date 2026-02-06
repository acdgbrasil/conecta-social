# [TASK-028] Criar Response Mapper (Adapter Outbound)

**Status:** ✅ Done
**Prioridade:** 🟡 Média
**Labels:** `arch`, `adapter`, `http`
**Origem:** `handbook/architecture/mapper-problems.md`

## Descrição
Use cases retornam `Result<boolean, DomainError>` e nao existe camada de adapter que traduza erros e resultados para HTTP/gRPC. Precisamos de um Response Mapper consistente.

## Tarefas
- [x] Definir contrato de resposta (HTTP/gRPC) para sucesso/erro.
- [x] Criar mapper de `DomainError -> Response`.
- [x] Criar mapper de `Result<T, DomainError> -> Response`.
- [x] Aplicar nos endpoints/handlers quando existirem (nenhum handler ainda).
- [x] Adicionar testes unitarios para o mapper.

## Critérios de Aceite
- [x] Toda resposta de adapter passa por mapper dedicado.
- [x] Erros de dominio são convertidos de forma consistente.

## Implementação
- Mapper genérico criado em `src/shared/adapters/response.mapper.ts` com contratos HTTP e gRPC.
- Export adicionado em `src/shared/adapters/index.ts`.
- Testes unitários em `src/shared/adapters/tests/unit/response.mapper.spec.ts`.
