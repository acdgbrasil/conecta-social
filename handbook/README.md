# Conecta Social — Handbook

Este diretório concentra toda a documentação viva do projeto. A ideia é manter a raiz do repositório o mais enxuta possível enquanto preservamos um ponto único de verdade para contexto, decisões e guias de trabalho.

## Como o handbook está organizado
- `reports/` — registros cronológicos (diários, code reviews e relatórios de refatoração). Funcionam como log histórico.
- `quality/` — estado da suíte de testes, planos de correção e métricas de qualidade.
- `process/` — regras operacionais, incluindo versionamento, retrocompatibilidade e rituais de PR.
- `cicd/` — estratégia de pipelines, ambientes, governança de deploy, segurança e releases.
- `principles/` — fundamentos técnicos e culturais (DDD + EDD, TDD/BDD e como manter testes como documentação viva).
- `tooling/` — notas de ferramentas, com foco especial em Bun e no ecossistema atual.
- `codebase/` — documentação viva dos módulos (`src/modules/**`) e kernel compartilhado (`src/shared/**`), incluindo guias detalhados e cookbooks.
- `references/` — material de apoio (livros, artigos, PDFs). Mantido aqui para consulta offline.

## Programa Atual: Roles & Permissões (2026-02-13)
- Diagnóstico técnico: `reports/TASK-049-roles-permissions-assessment.md`
- Modelo alvo RBAC + scopes: `reports/TASK-049-rbac-target-model.md`
- Plano de implementação em fases: `reports/TASK-049-implementation-plan.md`
- Plano de testes e observabilidade: `reports/TASK-049-test-and-observability-plan.md`

Objetivo imediato:
- Proteger 100% das rotas de mutação com autenticação e autorização explícitas.
- Garantir trilha auditável de decisões de acesso (401/403 e allow).

## Convenções gerais
- Alterações estruturais no código ou domínio devem ser refletidas neste handbook (reports, principles ou process).
- Sempre que uma decisão afetar retrocompatibilidade, registrar no arquivo `process/versioning.md`.
- Decisões de fronteira de segurança entre cliente e servidor devem ser registradas em `process/browser-trust-boundary.md`.
- Antes de abrir PR, revisar a seção `quality/` para garantir que o estado esperado dos testes esteja alinhado com a realidade.
- Testes fazem parte da documentação: manter descrições claras (`describe/it`) e, quando necessário, registrar resumos no handbook para orientar futuros colaboradores.

Para qualquer novo documento, escolha a sub-pasta existente que fizer sentido ou crie uma nova mantendo a hierarquia descrita acima. O objetivo é nunca mais se perguntar “onde registrar isso?”.

## Estado Atual (07/02/2026)
- **Estrutura**: Migrado para **Monolito Modular** (`src/modules` e `src/shared`). Runtime agnóstico via Ports & Adapters.
- **Shared Kernel**: Nova biblioteca de `ImutableList` de alta performance em `src/shared/fn-pattern/`, validada com testes de stress (5M itens) e análise de concorrência.
- **Domínio Social Care**: `src/modules/social-care`. Implementado, testado e com persistência (PostgreSQL) funcional.
- **Novos Módulos**: `analysis-bi` e `form-conversions` em fase de setup.
- **Infraestrutura**: Isolada em `src/infrastructure` (Runtime Bun, Drivers SQL).
- **Relatório de referência:** `handbook/reports/daily/daily-report-2026-02-06.md`.

## Snapshot de Qualidade & Performance (Shared Kernel)
Execução completa da suite de testes (`bun test src/shared/`) em 07/02/2026, validando a robustez do kernel.

```bash
bun test v1.3.8 (b64edcb4)

# --- PERFORMANCE & STRESS ---

src/shared/tests/performance/complexity.test.ts:
[Complexity Metrics - List.unique]
N=100   : 0.0364ms
N=1000  : 0.0372ms
N=10000 : 0.6506ms
✓ Complexity: List.unique > deve escalar linearmente (O(n))

src/shared/tests/performance/load.test.ts:
[Load Metrics]
Throughput: 30928 requests/sec
✓ Load: Concurrent Requests > deve processar requisições concorrentes

src/shared/tests/performance/system.test.ts:
[System Metrics - Memory]
Consumption : 0.00MB (Stable Heap)
✓ System: Resource Consumption > deve manter o heap sob controle

src/shared/tests/perf/imutable-list.concurrency.test.ts:
[Integrity] Sucesso! 1000 operações variadas mantiveram a imutabilidade.
[Starvation] Tempo total da bateria: 90.09ms (N=2,000,000)
✓ Full Concurrency & Starvation Analysis

src/shared/tests/perf/imutable-list.hasDuplicates.perf.test.ts:
primitive-1000 -> mean=0.075ms
nested-1000    -> mean=0.047ms
✓ Perf — List.hasDuplicates > coleta tempos médios

src/shared/tests/perf/imutable-list.stress.perf.test.ts:
TOTAL para 100,000 itens: 16.17ms
TOTAL para 1,000,000 itens: 155.25ms
TOTAL para 5,000,000 itens: 1319.64ms
✓ Stress Perf — ImutableList (Full Coverage Load)

# --- UNIT TESTS (100% Coverage) ---

src/shared/tests/unit/option-pattern/option.spec.ts:
✓ Option Pattern > 13 tests passed

src/shared/tests/unit/erros-pattern/DomainError.spec.ts:
✓ DomainError > 7 tests passed

src/shared/tests/unit/result-pattern/result.spec.ts:
✓ Result Pattern > 14 tests passed

src/shared/tests/unit/adapters/response-mapper.spec.ts:
✓ ResponseMapper > 6 tests passed

src/shared/tests/unit/adapters/adapters.spec.ts:
✓ Infrastructure Adapters > 7 tests passed

src/shared/tests/unit/aggregate-root/aggregate.spec.ts:
✓ Aggregate (Functional Core) > 6 tests passed

src/shared/tests/unit/uuid-pattern/uuid.spec.ts:
✓ Uuid (Functional Pattern) > 4 tests passed

src/shared/tests/unit/fn-pattern/pipe.spec.ts:
✓ pipe > 6 tests passed

src/shared/tests/unit/fn-pattern/imutable-list.test.ts:
✓ ImutableList > 13 tests passed

-----------------------------------------------------|---------|---------
File                                                 | % Funcs | % Lines 
-----------------------------------------------------|---------|---------
All files                                            |   99.73 |   99.92 
 src/shared/adapters/index.ts                        |  100.00 |  100.00 
 src/shared/erros-pattern/DomainError.ts             |  100.00 |  100.00 
 src/shared/fn-pattern/imutable-list.ts              |  100.00 |  100.00 
 src/shared/result-pattern/Result.ts                 |  100.00 |  100.00 
 ... (e demais arquivos core)
-----------------------------------------------------|---------|---------

106 pass
0 fail
Ran 106 tests across 19 files. [8.83s]
```
