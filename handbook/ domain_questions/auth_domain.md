# Documento de Domínio — **Auth Gateway** (“o Porteiro”)

> **Bounded Context:** *Auth Gateway* (IdP/SSO + decisão de autorização)
> **Posição:** Upstream de todos os serviços internos (OHS/PL).
> **Modo operacional:** **Offline-first** (instantâneos assinados + decisão local).
> **Separado de:** *User Directory & Provisioning* (administração de usuários, roles, memberships, tenants, vínculo com Person).

---

## 1. Propósito e Escopo

**Job to be done:**
Garantir **quem entra** (autenticação), **o que pode fazer** (autorização) e **quem está interagindo** (identidade e atributos mínimos) para **N serviços independentes** da intraweb, com **99,9%** de disponibilidade e suporte **offline-first**.

**Escopo incluído**

* Autenticação (local e federação OIDC).
* Emissão/validação de **tokens** (acesso/refresh) e **PST** (Policy Snapshot Token) para offline.
* Decisão de autorização central via `/authorize` (quando online) e **decisão local** (PEP) quando offline.
* Sessões, revogação, rotação de chaves (JWKS), auditoria de autenticação/decisão.
* Fornecer **perfil mínimo** de usuário (`/userinfo`) e **introspecção** de tokens (`/introspect`).

**Fora do escopo**

* Cadastro de usuários, roles, memberships, tenants, vínculo `User ↔ Person`, registro de clients (→ **User Directory**).
* Políticas de negócio complexas editáveis por times de produto (ponto de corte futuro: **Access Control**).

---

## 2. Ubiquitous Language

* **Usuário (User/Subject)**, **Sessão**, **Token** (access/refresh), **PST** (Policy Snapshot Token),
* **Role**, **Scope**, **Audience (aud)**, **Tenant**, **Unidade/Equipe** (escopos operacionais),
* **PEP** (Policy Enforcement Point — decisão local no serviço), **PDP** (Policy Decision Point — `/authorize`),
* **Client (Aplicativo)**, **Device** (dispositivo enrolado), **JWKS**, **Revogação**, **Introspecção**.

---

## 3. Capacidades (Capabilities)

1. **Autenticar** (local + OIDC federado) e criar **sessões**.
2. **Emitir tokens** (access/refresh) e **PST** (snapshot assinada de políticas/atributos).
3. **Decidir autorização** via `/authorize` (allow/deny), com justificativa e versão da política.
4. **Validar tokens** via `/introspect` e fornecer **perfil mínimo** via `/userinfo`.
5. **Revogar** sessões/tokens; distribuir **listas de revogação** (compatíveis com offline).
6. **Rotacionar chaves** (JWKS) e **publicar metadados OIDC**.
7. **Auditar** logins, decisões, concessões/revogações, erros de segurança.
8. **Operar offline-first**: prover artefatos (PST, revocation set, JWKS cache) e regras de “degraded mode”.

---

## 4. Agregados e Invariantes

> O Auth mantém **apenas o que é crítico para decisão/segurança**. Dados “de cadastro” vêm do Directory via projeções.

### 4.1 Session

* **Atributos (essência):** `sessionId`, `userId(sub)`, `tenantId`, `issuedAt`, `expiresAt`, `deviceId?`, `status {active, revoked, expired}`, `authMethods {pwd, oidc, mfa}`.
* **Invariantes:**

  * `issuedAt ≤ now ≤ expiresAt` para ativa.
  * Revogação é **imediata** e idempotente.
  * Uma sessão pertence a **um tenant**.
  * Se **device-bound**, requer prova de posse (PoP/DPoP).

### 4.2 Token (Access/Refresh)

* **Atributos:** `tokenId`, `sessionId`, `type {access, refresh}`, `aud`, `scopes`, `exp`, `revoked?`, `rotationCounter (refresh)`.
* **Invariantes:**

  * Access curto (≈15 min); refresh com rotação (replay detection).
  * `aud` precisa corresponder ao serviço consumidor.
  * `scopes` namespaced (ex.: `social-care:patient.read`).

### 4.3 PolicySnapshot (PST)

* **Atributos:** `pstId`, `sessionId`, `sub`, `tenantId`, `unitIds?`, `roles`, `scopes`, `aud[]`, `policyVersion`, `deviceBinding (cnf)`, `nbf`, `exp`.
* **Invariantes:**

  * Assinado por chave ativa (JWKS) e **verificável offline**.
  * TTL controlado (24–72h).
  * **DeviceBinding obrigatório** em cenários offline (se dispositivo enrolado).
  * `policyVersion` é monotônica; mudanças invalidam PST na próxima sincronização.

### 4.4 Keyset (JWKS)

* **Atributos:** `kid`, `alg`, `activeFrom`, `activeUntil?`.
* **Invariantes:**

  * Rotação com **overlap** (duas chaves válidas no período).
  * Nunca reusar `kid`.

### 4.5 RevocationSet

* **Atributos:** coleção compacta (ex.: bloom filter/CRL) de `sessionId`/`tokenId`.
* **Invariantes:**

  * Atualizável por *delta*; verificável offline.
  * **Autoritativa** quando online; **best-effort** offline.

> **Projeções (read models internos):** *UserAttributes*, *Role→Scopes*, *ServiceRegistry (audiences)* — **derivados** do Directory (não são agregados “donos da verdade”).

---

## 5. Invariantes Globais

* Decisão de autorização deve ser **determinística** para o mesmo `PST+request context+policyVersion`.
* Um **token** nunca concede permissão fora do `aud` e dos `scopes` presentes.
* **Tenant** sempre explícito nas claims.
* **Dados pessoais** mínimos no Auth; PII extendida fica fora (Directory/Social Care).
* **Offline**: decisões após expiração só no **degraded window** configurado; fora disso, negar.

---

## 6. Published Language (Contratos OHS)

> **Versão:** `v1` (compatibilidade progressiva). Não incluir dados além do necessário (LGPD).

### 6.1 OIDC & OAuth2

* `/.well-known/openid-configuration`, `/authorize`, `/token`, `/jwks.json`, `/userinfo`, `/introspect`, `/revocation`, `/logout` (front/back channel), `/device_authorization` (opcional).
* **Fluxos suportados:** Authorization Code + PKCE, Client Credentials, Device Code, Refresh.

### 6.2 `/authorize` (PDP online)

**Request (exemplo):**
`{ subject, action: "ops:order.complete", resource?: { type, id }, context?: { unitId?, time?, geo? } }`
**Response:**
`{ allowed: boolean, reason: string, policyVersion: string, obligations?: [...] }`

### 6.3 `/introspect`

**Request:** `{ token }`
**Response:** `{ active, sub, tenantId, aud, scopes, exp, iat, roles?, unitIds? }`

### 6.4 `/userinfo` (perfil mínimo)

`{ sub, name?, email?, tenantId, unitIds?, roles? }`

### 6.5 Artefatos offline

* **`/pst/issue`**: emite PST (snapshot assinada).
* **`/revocations`**: baixa **delta** de revogações desde `cursor`.
* **`/jwks.json`**: chaves públicas ativas.

---

## 7. Claims & Escopos (padrão)

* **Obrigatórias:** `sub`, `tenantId`, `aud`, `scope[]`, `exp`, `iat`, `jti`, `sessionId`.
* **Contextuais:** `unitIds[]`, `teamIds[]`, `roles[]`, `policyVersion`, `cnf` (device-binding).
* **Escopos namespaced (exemplos):**

  * `social-care:patient.read`, `social-care:appointment.create`,
  * `ops:order.complete`, `ops:queue.call`,
  * `analytics:report.export`.

---

## 8. Padrões Offline-first

* **PST**: autoridade local para **N horas/dias** (48h sugerido).
* **PEP local (nos serviços)**: valida JWT/PST (JWKS cache), confere `aud`, `scopes`, `tenantId`, `unitIds`, aplica **regras de degradação** (ex.: permitir apenas leitura essencial após expiração < 6h).
* **Revocation Set**: baixado periodicamente; se offline, usa último snapshot.
* **Auditoria local**: *append-only*, com **hash encadeado**; ao reconectar, subir para o Auth (que sela/assina timestamp de servidor).

---

## 9. Eventos de Domínio (PL — assíncronos)

* `SessionCreated`, `SessionRevoked`, `SessionExpired`
* `TokenIssued`, `TokenRefreshed`, `TokenRevoked`
* `PSTIssued`, `PSTInvalidated`
* `KeyRotated`
* (Derivados do Directory por projeção): `MembershipChanged`, `RoleGranted`, `RoleRevoked`

**Uso:** auditoria, sincronização de caches, alerta de segurança.
**Observação:** consumidores **não** dependem desses eventos para autorizar (apenas para otimizações/observabilidade).

---

## 10. Integrações e Context Map

* **Upstream do Auth:** *User Directory & Provisioning* → fornece **membership/roles**, **Service Registry** e atributos (via eventos/feeds).
* **Downstream do Auth:** **todos os serviços** → consomem **tokens/PST**, `/authorize`, `/introspect`, `/userinfo`.

```
[User Directory] --(MembershipChanged, RoleGranted)--> [Auth Gateway OHS/PL]
                                                      ▲
                           /authorize, /introspect    │
   [Serviço A]   <------------------------------------┤
   [Serviço B]   <------------------------------------┤   (N serviços)
   [Serviço C]   <------------------------------------┘
```

---

## 11. NFRs (Qualidade & Segurança)

* **Disponibilidade:** 99,9% (Auth online). Decisão **local** garante continuidade offline.
* **Latência alvo:** p95 < 100ms em `/authorize`.
* **Segurança:** TLS, HSTS, rate limiting por `clientId`, detecção de anomalias (tentativas, localizações), **rotação de chaves** (30 dias), assinatura `RS256/ES256`.
* **LGPD:** minimização de dados, criptografia em repouso para dados sensíveis e logs, controle de acesso a trilhas, retenção (ex.: 5 anos).
* **Observabilidade:** métricas por fluxo (login, emissão token, autorizações allow/deny), auditoria com trilha imutável.

---

## 12. Erros & Políticas (Taxonomia)

* **AuthN:** `invalid_credentials`, `account_locked`, `mfa_required`, `idp_unavailable`.
* **AuthZ:** `insufficient_scope`, `policy_denied`, `tenant_mismatch`, `audience_mismatch`.
* **Tokens:** `token_expired`, `token_revoked`, `invalid_signature`, `rotation_required`.
* **Offline:** `pst_expired`, `revocation_data_stale` (tratar com degraded mode).
* **Operação:** `rate_limited`, `invalid_client`, `invalid_redirect_uri`.

---

## 13. Estratégia de Testes (conceitual)

* **Unit**: invariantes de `Session`, `Token`, `PST`; verificação de claims; política de janela degradada.
* **Integration**: `/authorize` e `/introspect` com tokens válidos/expirados/revogados; JWKS rotação; deltas de revogação.
* **Contract/Pact**: OIDC discovery, formatos de tokens, payload de `/authorize` por serviço.
* **Functional/E2E**: fluxos OAuth (Auth Code + PKCE, Refresh, Device Code), revogação, decisão allow/deny.
* **Chaos/Resilience**: queda do Directory (Auth continua), rotação de chaves, perda temporária de rede.

---

## 14. Versionamento & Evolução

* **APIs/Eventos:** `v1` em rotas e tópicos.
* **Deprecação:** anunciar + coexistir `v1/v2` por janela definida (ex.: 6–12 meses).
* **Preparar 3º contexto (Access Control):** `/authorize` já padronizado; mover PDP para serviço dedicado **sem quebrar clientes**.

---

## 15. Governaça de Onboarding de Serviço (resumo)

1. **Registrar serviço** no Directory: `serviceId`, `aud`, `scopes` canônicos.
2. **Mapear roles → scopes** (por tenant).
3. **Configurar client** (OAuth): `redirect_uris`, `grant_types`, `token lifetimes`.
4. **Pact tests** com Auth (discovery, `/token`, JWKS, `/authorize`).
5. **Distribuir PEP** (biblioteca) com validação de PST e políticas de degraded mode.

---

## 16. Decisões de Design (ADRs resumidos)

* **D-001**: **RBAC base + ABAC leve** via claims (`tenantId`, `unitIds`); *por quê:* simples, auditável, escalável por serviço.
* **D-002**: **PST para offline** com device binding (DPoP/PoP); *por quê:* decisão local segura e traçável.
* **D-003**: **Namespacing de scopes** por serviço; *por quê:* isola domínios e evita colisões.
* **D-004**: **Rotação de chaves com overlap**; *por quê:* zero-downtime na validação distribuída.
* **D-005**: **Tokens curtos + refresh com rotação**; *por quê:* mitiga vazamento e replay.
* **D-006**: **Auth separado do Directory**; *por quê:* SLAs distintos e redução de acoplamento.

---

## 17. Exemplos de Catálogo Inicial (canônico)

* **Serviço `social-care`**
  Scopes: `social-care:patient.read|create|update`, `social-care:appointment.create|read`, `social-care:report.create`
* **Serviço `ops` (Operação)**
  Scopes: `ops:queue.call|manage`, `ops:visit.start|complete`, `ops:order.complete|reschedule`
* **Serviço `analytics`**
  Scopes: `analytics:report.read|export`

**Roles (exemplo por tenant):**

* `social.worker` → `social-care:patient.read`, `social-care:appointment.create`
* `ops.field.agent` → `ops:visit.start|complete`, `ops:order.complete`
* `admin.tenant` → superconjunto controlado (com consentimento e justificativa)

---

## 18. Segurança Operacional & Incidentes

* **Detecção:** anomalias de login (geografia, horário), falhas repetidas, tokens inválidos.
* **Resposta:** revogar sessões/tokens afetados; publicar revocation delta; rotação emergencial de JWKS; notificação aos serviços.
* **Forense:** correlacionar auditoria local (hash chain) com selos de servidor pós-sincronização.

---

## 19. Métricas-chave (SLO/observabilidade)

* Taxa de sucesso de login, p95/p99 de `/authorize`, taxa de `deny`, idade média de PST na borda, percentual de decisões em **degraded mode**, erros por `clientId`, latência de rotação de JWKS propagada.

---

## 20. Entregáveis para consumidores (dev experience)

* **Discovery OIDC** + documentação do **PL** (exemplos de tokens com claims).
* **Biblioteca PEP** (validação de PST, degraded mode, cache JWKS, consumo de revocation set).
* **Catálogo de scopes** por serviço e guia de **roles→scopes** (do Directory).
* **Guia de offline-first** (janelas, revogação, auditoria local).

---

### Conclusão

Este documento define o **Auth Gateway** como **porteiro universal**: OHS/PL estável, **offline-first** com **PST** e decisão local, **RBAC+ABAC leve**, namespacing por serviço, e trilhas de auditoria robustas — tudo separado do **User Directory** (admin/provisioning).

Se quiser, eu já gero o **documento irmão** do *User Directory & Provisioning* (agregados, invariantes, eventos, contratos) e depois montamos o **Context Map** completo com o `social-care` e “N” serviços.
