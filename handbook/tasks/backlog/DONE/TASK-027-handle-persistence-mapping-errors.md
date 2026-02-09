# [TASK-027] Tratar Erros de Mapping na Persistência

**Status:** ✅ Done
**Prioridade:** 🟠 Alta
**Labels:** `data-consistency`, `persistence`, `error-handling`
**Origem:** `handbook/architecture/mapper-problems.md`

## Descrição
Hoje o repositório ignora registros com erro de criação de VO/entidades. Isso mascara corrupção de dados e pode devolver um agregado inconsistente. Precisamos tornar falhas de mapping explícitas.

## Tarefas
- [x] Definir estratégia de falha (ex.: retornar erro de consistência ao primeiro item inválido).
- [x] Implementar coleta de erros e retorno com contexto (ID do registro, coluna, motivo).
- [x] Atualizar `PostgresPatientRepository`/mappers para não ignorar erros.
- [x] Adicionar testes cobrindo cenários de dados inválidos.

## Critérios de Aceite
- [x] Erros de mapping não são silenciosos.
- [x] Casos de corrupção retornam `DomainError` com contexto mínimo para debug.

## Implementação
- Mapper de persistência passa a coletar `issues` (entidade, campo e motivo) e retornar `APP-006` quando encontra corrupção.
- `PostgresPatientRepository` propaga o erro do mapper sem reconstrução parcial.
- Testes adicionados para garantir falha explícita ao ler dados inválidos.
