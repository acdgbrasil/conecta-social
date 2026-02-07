# [TASK-033] Refinamento Estrutural e Limpeza de Code Smells do Domínio

**Status:** 🔴 To Do
**Prioridade:** 🟡 Média
**Labels:** `refactor`, `domain`, `dx`
**Origem:** `handbook/reports/code-reviews/audit-2026-02-07-domain-code-smells.md`

## Descrição
Após a migração para o modelo funcional, identificamos oportunidades para melhorar a organização física do código, reduzir boilerplate e fortalecer os conceitos de DDD (Aggregate Boundary).

## Tarefas

### 1. Modularização do Agregado Patient
- [ ] Criar `src/modules/social-care/domain/entities/patient/` folder.
- [ ] Mover `Patient.entity.ts` para dentro desta pasta.
- [ ] Extrair lógica de Família para `patient.family.ts`.
- [ ] Extrair lógica de Encaminhamentos e Atendimentos para arquivos dedicados.
- [ ] Manter o namespace `Patient` unificado através de exportações no `index.ts` da pasta.

### 2. Otimização de Eventos
- [ ] Criar helper de construção de eventos em `domain/events/factory.ts`.
- [ ] Refatorar todos os eventos para usar o helper, eliminando repetição de UUID.

### 3. Consolidação de Value Objects
- [ ] Eliminar arquivos em `value-objects/props/` para VOs simples.
- [ ] Co-locar tipos de propriedades dentro dos arquivos dos VOs.

### 4. Limpeza de Portas e Serviços
- [ ] Remover `addFamilyMember` do `PatientRepositoryPort`.
- [ ] Mesclar lógica da pasta `services/` nas novas especializações do Agregado.

## Critérios de Aceite
- [ ] Zero classes no domínio.
- [ ] Tamanho máximo de arquivos de comportamento < 150 linhas.
- [ ] Suite de testes unitários (80 testes) continua verde.
- [ ] Contrato do repositório simplificado (Conceito de Agregado preservado).
