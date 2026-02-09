# [TASK-033] Refinamento Estrutural e Limpeza de Code Smells do Domínio

**Status:** 🟡 In Progress
**Prioridade:** 🟡 Média
**Labels:** `refactor`, `domain`, `dx`
**Origem:** `handbook/reports/code-reviews/audit-2026-02-07-domain-code-smells.md`

## Descrição
Após a migração para o modelo funcional, identificamos oportunidades para melhorar a organização física do código, reduzir boilerplate e fortalecer os conceitos de DDD (Aggregate Boundary).

## Tarefas

### 1. Modularização do Agregado Patient
- [x] Criar `src/modules/social-care/domain/entities/patient/` folder.
- [x] Mover `Patient.entity.ts` para dentro desta pasta.
- [x] Extrair lógica de Família para `patient.family.ts`.
- [x] Extrair lógica de Encaminhamentos e Atendimentos para arquivos dedicados.
- [x] Manter o namespace `Patient` unificado através de exportações no `index.ts` da pasta.

### 2. Otimização de Eventos
- [x] Criar helper de construção de eventos em `domain/events/factory.ts`.
- [x] Refatorar todos os eventos para usar o helper, eliminando repetição de UUID.

### 3. Consolidação de Value Objects
- [x] Eliminar arquivos em `value-objects/props/` para VOs simples.
- [x] Co-locar tipos de propriedades dentro dos arquivos dos VOs.

### 4. Limpeza de Portas e Serviços
- [x] Remover `addFamilyMember` do `PatientRepositoryPort`.
- [x] Mesclar lógica da pasta `services/` nas novas especializações do Agregado.

## Critérios de Aceite
- [x] Zero classes no domínio.
- [x] Tamanho máximo de arquivos de comportamento < 150 linhas.
- [x] Suite de testes unitários da camada application (28 testes) continua verde.
- [x] Contrato do repositório simplificado (Conceito de Agregado preservado).

## Validação de Estado (2026-02-08)
- Estrutura de `patient/` e namespace consolidado em `src/modules/social-care/domain/entities/patient`.
- Helper de eventos em `src/modules/social-care/domain/events/factory.ts`.
- `PatientRepositoryPort` sem `addFamilyMember` em `src/modules/social-care/domain/repository/patient.repository.port.ts`.
- Pendência: estabilizar suíte completa da camada `application` antes de marcar a task como 100% concluída.
