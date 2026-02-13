# Roles & Permissions - Diagnóstico Técnico

**Data:** 2026-02-13  
**Reviewer:** Codex (Arquitetura + Segurança de Aplicação)  
**Escopo:** `src/**`, `handbook/domain_questions/people-context/**`, `server.ts`, API Social Care

---

## Sumário Executivo

Estado atual: o projeto já possui base de identidade (Logto + People Context), porém **não existe enforcement de autorização na API**.

Resultado: qualquer cliente que alcance os endpoints de `social-care` pode executar ações críticas, independentemente de role/scope.

---

## Achados Principais

### 1. API sem middleware de autenticação/autorização (Crítico)

**Evidência:**
- `src/server.ts:128` monta `app.route("/social-care", socialCareRoutes)`
- `src/server.ts:132` expõe webhook
- Não há `app.use` com guard de token/scope antes das rotas de negócio

**Impacto:** risco de acesso indevido a dados e comandos críticos.

---

### 2. Contrato de Auth existe, implementação não (Crítico)

**Evidência:**
- `src/shared/ports/auth.port.ts:16` define `AuthPort`
- `validateToken` e `hasScopes` estão apenas no contrato

**Impacto:** arquitetura prevê IAM, mas runtime não aplica validação real.

---

### 3. Middleware de auth existe apenas como mock de teste (Crítico)

**Evidência:**
- `src/shared/adapters/tests/unit/auth.middleware.spec.ts:11`
- Comentário explícito de middleware "futuro"

**Impacto:** confiança falsa de cobertura; proteção real inexistente.

---

### 4. Endpoints de escrita sem política de autorização (Crítico)

**Evidência:**
- `src/modules/social-care/interface/adapter/http/social-care.http.adapter.ts:53` até `:311`
- Todas as rotas são mutações (`POST/PATCH/DELETE`) e não declaram requisito de role/scope no runtime.

**Impacto:** alta superfície para abuso de comandos sensíveis.

---

### 5. Modelo de roles em People Context sem validação forte no banco (Médio)

**Evidência:**
- `src/modules/people-context/domain/entities/person.ts:14` define enum TS (`ADMIN`, `ASSISTANT_SOCIAL`, `VISITOR`, `PROFESSIONAL`)
- `src/modules/people-context/interface/database/postgres/migrations/001_create_people_table.sql:11` usa `roles TEXT[]`

**Impacto:** risco de drift semântico e valores inválidos persistidos.

---

### 6. Taxonomia de roles desalinhada entre código e documentação (Médio)

**Evidência:**
- Código: `Role` curta em `person.ts:14`
- Documentação de domínio: `Professional:<Setor>`, `Patient`, `Visitor`, `Admin` em `handbook/domain_questions/people-context/agregados_entidades.md`

**Impacto:** regras de autorização inconsistentes entre times.

---

### 7. Provisionamento inicial de usuário com role default VISITOR (Informativo)

**Evidência:**
- `src/modules/people-context/application/use-cases/register-person-from-logto.use-case.ts:40`

**Impacto:** correto para onboarding, mas exige etapa explícita de promoção de role para operar módulos.

---

### 8. Client M2M do Logto usa scope amplo `all` (Médio)

**Evidência:**
- `src/infrastructure/auth/logto/management.client.ts:34`

**Impacto:** violação de menor privilégio no canal machine-to-machine.

---

## Riscos Priorizados

1. Acesso não autorizado aos comandos de Social Care (alto impacto, alta probabilidade).
2. Drift de papéis/permissões entre domínio e infraestrutura.
3. Dificuldade de auditoria forense (sem trilha de decisão de autorização).

---

## Recomendação Imediata (Sprint 1)

1. Implementar `AuthPort` real para Logto JWT validation.
2. Criar middleware de auth + middleware de autorização por scopes.
3. Proteger todas as rotas de `social-care` por política explícita.
4. Padronizar catálogo de roles/permissões e congelar nomenclatura em contrato único.

---

## Referências

- `src/server.ts:128`
- `src/server.ts:132`
- `src/shared/ports/auth.port.ts:16`
- `src/shared/adapters/tests/unit/auth.middleware.spec.ts:11`
- `src/modules/social-care/interface/adapter/http/social-care.http.adapter.ts:53`
- `src/modules/people-context/domain/entities/person.ts:14`
- `src/modules/people-context/interface/database/postgres/migrations/001_create_people_table.sql:11`
- `src/modules/people-context/application/use-cases/register-person-from-logto.use-case.ts:40`
- `src/infrastructure/auth/logto/management.client.ts:34`
