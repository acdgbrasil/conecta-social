# Card Diário — 14/11/2025

## Objetivo do dia
Preparar arquitetura orientada a protocolos onde fizer sentido (serviços externos/infra), manter o modelo atual para entidades/VOs e avançar nos pendentes já mapeados (bench de `ImutableList`, automação de versionamento).

## Prioridades (ordem sugerida)
1. **Protocolos para integrações** — definir interfaces + PoP para dependências externas/configuráveis.
2. **Bench de duplicados** — criar script perf de `ImutableList.hasDuplicates`.
3. **Versionamento e changelog** — rascunhar automação `bun pm version`.
4. **Doc do domínio** — expandir handbook para social-care com receitas/práticas.
5. **Domínio completo (fluxos críticos)** — entregar o item 01 do plano: eventos, ACLs, casos de uso/API e persistência alinhados ao agregado `Patient`.

## Plano executivo rápido
- **Protocolos/PoP**
  - Criar `packages/shared/protocols/` com interfaces e fábricas (command-like) para: `Clock` (agora dependemos de `Date.now()`), `IdProvider` (Uuid v7), `Notifier` (placeholder), `EventBus` (futuro).
  - Fornecer implementações padrão em `packages/shared/adapters/` (ex.: `systemClock`, `uuidV7Provider`), todas retornando objetos `satisfies Protocol`.
  - Ajustar `Patient` e pontos de domínio que hoje chamam `new Date()`/`Uuid.create()` diretamente para receber dependências (PoP onde beneficia testabilidade).
  - Manter entidades/VOs como estão (métodos de instância + `Result`); não reescrever para estilo puramente funcional.
  - Usar estilo command onde já adotamos `Result`: expor funções `execute(input): Result<Output, DomainError>` para protocolos que encapsulam side effects.
- **Bench/Perf**
  - Criar `packages/shared/tests/perf/imutable-list.hasDuplicates.perf.ts` conforme plano de 07/11: tamanhos 10..1000, tipos primitivos/objetos rasos/aninhados; medir ms médios com `performance.now()`.
  - Registrar resultado em `handbook/reports/perf/imutable-list-hasDuplicates.md` (tabela + threshold sugerido).
- **Versionamento**
  - Esboçar script `bun run version:<type>` ou `scripts/version.ts` que roda `bun pm version <type>` e inicia bloco de changelog (draft) seguindo `handbook/process/versioning.md`.
  - Documentar fluxo no handbook (`process/versioning.md`) e abrir TODO para integração no CI.
- **Documentação social-care**
  - Expandir `handbook/codebase/social/social-care/documentation.md` com receitas (cookbook) similares ao `shared`: erros, coleções imutáveis, uso de `Result/Option`, exemplos de protocolos (Clock/IdProvider) aplicados ao agregado `Patient`.
  - Descrever eventos/integrações planejadas do agregado antes da `v0.1.0` (mesmo que como placeholders).

## Checks de entrega
- [x] Protocolos criados (`Clock`, `IdProvider`, `Notifier`, `EventBus`) + adapters default.
- [x] Pontos de domínio consumindo protocolos em vez de `Date.now()`/`Uuid.create()` diretos onde houver side effects.
- [x] Script perf `imutable-list.hasDuplicates` rodando e resultados anotados (thresholds configuráveis).
- [x] Draft de automação de versionamento/changelog disponível (`scripts/version.ts` + handbook).
- [x] Handbook atualizado (social-care cookbook + perf + versioning).
- [ ] Item 01 — Domínio completo: eventos de domínio definidos/publicados, ACLs/DTOs priorizados, camada de casos de uso/API e repositórios/persistência alinhados ao agregado `Patient`.
