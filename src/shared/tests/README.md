# Estrutura de Testes — Shared Kernel

Este diretório centraliza a validação do `src/shared`. Para manter a organização e evitar a fragmentação do passado, siga rigorosamente a hierarquia abaixo:

## Hierarquia de Diretórios

### 1. `unit/<package>/`
**O que é:** Testes de unidade puros que validam a lógica e o contrato de cada utilitário.
- **Exemplo:** `src/shared/tests/unit/fn-pattern/imutable-list.test.ts`
- **Regra:** Todo novo arquivo em `src/shared` deve ter seu par correspondente aqui.

### 2. `perf/`
**O que é:** Benchmarks, Testes de Stress e Análise de Concorrência.
- **Arquivos Atuais:**
  - `imutable-list.hasDuplicates.perf.test.ts` (Bench Básico)
  - `imutable-list.stress.perf.test.ts` (Carga massiva: 5M+ itens)
  - `imutable-list.concurrency.test.ts` (Integridade e Starvation)
- **Regra:** Use para validar eficiência algorítmica e limites do runtime (Bun).

### 3. `regression/`
**O que é:** Testes que reproduzem bugs reportados e corrigidos.
- **Objetivo:** Garantir que um bug antigo nunca volte (cenários RED fixos).

---

## 🚫 O que NÃO fazer (Anti-patterns)
- **Não criar pastas redundantes:** Evite criar `bench/`, `load/`, `performance/` ou `system/` dentro de `shared/tests`. Tudo relacionado a métricas e carga deve residir em `perf/`.
- **Não colocar testes junto ao código:** Mantenha `src/shared/<package>` limpo, contendo apenas implementação. Os testes devem estar neste diretório (`src/shared/tests`).
- **Não ignore a cobertura:** O projeto exige **85% de cobertura** mínima. Testes de performance não substituem testes de unidade para fins de cobertura de código.

## Execução
- **Unitários:** `bun test src/shared/tests/unit`
- **Performance:** `bun test src/shared/tests/perf`
- **Tudo:** `bun test src/shared/tests`