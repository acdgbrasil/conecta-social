# Quality Tasks — Status Consolidado

Objetivo: refletir o estado atual de planejamento em `handbook/tasks/quality`, incluindo quando algo foi feito/planejado, relevancia e se esta pendente ou descontinuado.

## Visao geral (2026-02-07)
- Total de tarefas: 9
- Concluidas: 3 (TASK-021, TASK-022, TASK-023)
- Planejadas/pendentes: 5 (TASK-015, TASK-029, TASK-030, TASK-031, TASK-032)
- Revisoes/diagnosticos: 1 (TASK-024)
- Descontinuadas: 0 (nenhuma marcada como encerrada/descontinuada)

## Linha do tempo (datas citadas nos arquivos)
- 2025-11-14: origem do benchmark de ImutableList (TASK-022).
- 2026-01-09: origem da remocao de `any` em testes (TASK-021).
- 2026-02-06: data do review do dominio social-care (TASK-024, pelo contexto do arquivo).
- 2026-02-07: criacao das tasks de migracao do dominio para modelo funcional (TASK-029 a TASK-032).

## Indice de tarefas (estado atual)

### TASK-015 — CI GitHub Actions
Arquivo: `handbook/tasks/quality/TASK-015-github-actions-ci-setup.md`
- Status: To Do
- Planejado: sem data explicita
- Relevancia: alta (necessario para automatizar testes de PR)
- Estado: pendente
- Observacao: depende de container Postgres e segredos para credenciais.

### TASK-021 — Remover `any` dos testes
Arquivo: `handbook/tasks/quality/TASK-021-remove-any-from-tests.md`
- Status: Done
- Origem: Audit Code Review 2026-01-09
- Relevancia: historica (concluida)
- Estado: encerrada

### TASK-022 — Benchmarks de ImutableList no CI
Arquivo: `handbook/tasks/quality/TASK-022-benchmarks-imutable-list.md`
- Status: Done
- Origem: Relatorio de Refatoracao 2025-11-14
- Relevancia: historica (concluida)
- Estado: encerrada

### TASK-023 — Modernizar libs funcionais (Result/Option/Fn)
Arquivo: `handbook/tasks/quality/TASK-023-modernize-typescript-libs.md`
- Status: Done
- Planejado: sem data explicita
- Relevancia: historica (concluida)
- Estado: encerrada
- Observacao: documento detalha plano e breaking changes; manter apenas como referencia.

### TASK-024 — Review de Qualidade do dominio social-care
Arquivo: `handbook/tasks/quality/TASK-024-social-care-domain-review.md`
- Status: Action Needed
- Planejado/feito: review ja produzido
- Relevancia: atual enquanto achados nao forem enderecados
- Estado: pendente (acao requerida em cima dos achados)

### TASK-029 — Fundamentos para Dominio Funcional (FP)
Arquivo: `handbook/tasks/quality/TASK-029-domain-fp-foundations.md`
- Status: To Do
- Planejado: 2026-02-07
- Relevancia: alta (pre-requisito para migracao do dominio)
- Estado: pendente

### TASK-030 — Migracao de Value Objects para Modelo Funcional
Arquivo: `handbook/tasks/quality/TASK-030-domain-fp-value-objects.md`
- Status: To Do
- Planejado: 2026-02-07
- Relevancia: alta (base do dominio funcional)
- Estado: pendente

### TASK-031 — Migracao de Entidades Filhas para Modelo Funcional
Arquivo: `handbook/tasks/quality/TASK-031-domain-fp-entities.md`
- Status: To Do
- Planejado: 2026-02-07
- Relevancia: alta (impacto direto nas regras de negocio)
- Estado: pendente

### TASK-032 — Migracao do Agregado Patient para Modelo Funcional
Arquivo: `handbook/tasks/quality/TASK-032-domain-fp-patient-aggregate.md`
- Status: To Do
- Planejado: 2026-02-07
- Relevancia: critica (agregado central)
- Estado: pendente

## Proximas acoes sugeridas
1. TASK-015: criar workflow de CI com Postgres e definir segredos.
2. TASK-024: priorizar achados de severidade alta e definir plano de correcoes.
3. TASK-029: implementar fundamentos FP para destravar migracao do dominio.
4. TASK-030/031/032: executar migracao do dominio em ordem (VOs -> Entidades -> Agregado).
