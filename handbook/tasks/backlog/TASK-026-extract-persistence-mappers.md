# [TASK-026] Extrair Mappers de Persistência do Repositório

**Status:** ✅ Done
**Prioridade:** 🟡 Média
**Labels:** `arch`, `persistence`, `mapper`
**Origem:** `handbook/architecture/mapper-problems.md`

## Descrição
O repositório Postgres reconstrói o domínio inline. Isso mistura persistência, mapping e regras de domínio, dificultando reutilização e testes isolados. Precisamos separar mappers de persistência para entrada/saída do banco.

## Tarefas
- [x] Criar módulo de mappers em `src/modules/social-care/interface/adapter/mappers/persistence`.
- [x] Extrair lógica de reconstrução do agregado (row -> domain) para funções dedicadas.
- [x] Extrair lógica de serialização (domain -> row/jsonb) para funções dedicadas.
- [x] Atualizar `PostgresPatientRepository` para usar os mappers.
- [x] Criar testes unitários para os mappers de persistência.

## Critérios de Aceite
- [x] `PostgresPatientRepository` não contém lógica de criação de VO/entidades.
- [x] Mappers de persistência testados unitariamente.

## Implementação
- Mapper extraído para `src/modules/social-care/interface/adapter/mappers/persistence/patient.persistence.mapper.ts`.
- `PostgresPatientRepository` delega conversão para `mapPatientToPersistence` e `mapPatientPersistenceToDomain`.
- Testes unitários adicionados em `src/modules/social-care/interface/adapter/mappers/persistence/tests/unit/patient.persistence.mapper.spec.ts`.
