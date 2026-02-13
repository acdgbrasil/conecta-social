# Roles & Permissions - Plano de Implementação

**Data:** 2026-02-13  
**Horizonte:** 4 sprints curtas

---

## Sprint 1 - Fundação de Autorização

### Entregas

1. Implementar `AuthPort` real para validação de JWT Logto.
2. Criar middleware `authn` (token) e `authz` (scopes).
3. Aplicar middleware no `server.ts` antes de `app.route("/social-care", ...)`.
4. Padronizar respostas:
- 401: sem token/token inválido
- 403: sem permissão

### Arquivos-alvo

- `src/shared/ports/auth.port.ts`
- `src/infrastructure/auth/logto/*` (adapter JWT)
- `src/server.ts`
- novo middleware em `src/shared/adapters` (ou `src/infrastructure/runtime/bun/http`)

---

## Sprint 2 - Política por Endpoint

### Entregas

1. Declarar mapa `endpoint -> requiredScopes`.
2. Cobrir todas as rotas de `social-care`.
3. Remover qualquer bypass implícito.

### Arquivos-alvo

- `src/modules/social-care/interface/adapter/http/social-care.http.adapter.ts`
- middleware de autorização

---

## Sprint 3 - People Context + Governança de Roles

### Entregas

1. Fluxo de promoção de role (ex: `VISITOR` -> `ASSISTANT_SOCIAL`).
2. Validar valores de role persistidos.
3. Sincronizar role/scopes no Logto de forma audível.

### Arquivos-alvo

- `src/modules/people-context/domain/entities/person.ts`
- `src/modules/people-context/interface/adapter/persistence/person.persistence.adapter.ts`
- migrations SQL (constraint para roles válidas)

---

## Sprint 4 - Hardening e Operação

### Entregas

1. Auditoria de autorização (log estruturado).
2. Métricas de 401/403 por endpoint.
3. Alertas para picos de negação.
4. Revisão de scopes M2M (eliminar `all`).

### Arquivos-alvo

- `src/infrastructure/auth/logto/management.client.ts`
- pipeline de observabilidade/CI

---

## Backlog Técnico (Sequência Recomendada)

1. `RBAC-001` - Auth middleware real
2. `RBAC-002` - Guardas de escopo por rota
3. `RBAC-003` - Constraint de roles no banco
4. `RBAC-004` - Promoção de role e trilha de auditoria
5. `RBAC-005` - Revisão de M2M e scopes mínimos
6. `RBAC-006` - Testes E2E de autorização

---

## Critérios de Aceite Globais

1. Nenhuma rota crítica sem proteção.
2. Cobertura de testes de autorização >= 90% dos caminhos de decisão.
3. Logs suficientes para explicar qualquer 401/403 em produção.
4. Documentação de roles/scopes atualizada no handbook.
