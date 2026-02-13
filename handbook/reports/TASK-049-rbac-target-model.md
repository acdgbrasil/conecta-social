# Roles & Permissions - Modelo Alvo (RBAC + Scopes)

**Data:** 2026-02-13  
**Status:** Proposta para implementação

---

## Objetivo

Definir um modelo único e executável de autorização para:
- API `social-care`
- integração com Logto (JWT + scopes)
- sincronização com People Context

---

## Princípios

1. Menor privilégio por padrão.
2. Negação por padrão (deny-by-default).
3. Separação entre identidade (`sub`, `personId`) e autorização (`scopes`, `roles`).
4. Política declarativa por endpoint.

---

## Catálogo de Roles (Canônico)

1. `ADMIN`
2. `ASSISTANT_SOCIAL`
3. `PROFESSIONAL`
4. `VISITOR`

Observação: manter este catálogo como baseline compatível com o estado atual do código e evoluir depois para sub-roles por setor.

---

## Catálogo de Permissões (Scopes)

Padrão: `<bounded-context>:<resource>:<action>`

1. `social-care:patients:create`
2. `social-care:patients:read`
3. `social-care:patients:update`
4. `social-care:family-members:manage`
5. `social-care:appointments:create`
6. `social-care:referrals:create`
7. `social-care:rights-violations:create`
8. `social-care:socioeconomic:update`
9. `people:profiles:read`
10. `people:profiles:update`

---

## Matriz Role x Scope (Inicial)

1. `ADMIN`:
- todos os scopes acima.

2. `ASSISTANT_SOCIAL`:
- todos os scopes de `social-care:*`.

3. `PROFESSIONAL`:
- `social-care:patients:read`
- `social-care:appointments:create`
- `social-care:referrals:create`

4. `VISITOR`:
- sem scopes de Social Care (acesso negado ao módulo).

---

## Matriz Endpoint x Scope Obrigatório

1. `POST /social-care/patients` -> `social-care:patients:create`
2. `POST /social-care/patients/{id}/family-members` -> `social-care:family-members:manage`
3. `DELETE /social-care/patients/{id}/family-members/{memberId}` -> `social-care:family-members:manage`
4. `POST /social-care/patients/{id}/appointments` -> `social-care:appointments:create`
5. `POST /social-care/patients/{id}/referrals` -> `social-care:referrals:create`
6. `POST /social-care/patients/{id}/rights-violations` -> `social-care:rights-violations:create`
7. `PATCH /social-care/patients/{id}/housing-condition` -> `social-care:socioeconomic:update`
8. `PATCH /social-care/patients/{id}/socioeconomic-situation` -> `social-care:socioeconomic:update`

---

## Claims JWT Esperadas

1. `sub` (obrigatória)
2. `scope` (string com scopes separados por espaço)
3. `client_id` (quando M2M)
4. `personId` em `custom_data`/claim custom (quando aplicável)
5. `roles` (opcional em claim custom para observabilidade, sem substituir scopes)

---

## Política para M2M

1. M2M não acessa rotas de usuário final por padrão.
2. M2M recebe scopes mínimos para integração específica.
3. Evitar `scope=all` para rotinas de gestão.

---

## DoD do Modelo Alvo

1. Toda rota de mutação com scope explícito.
2. Requisição sem token -> 401.
3. Token válido sem scope necessário -> 403.
4. Logs de negação com `request_id`, `sub`, `endpoint`, `required_scopes`.
