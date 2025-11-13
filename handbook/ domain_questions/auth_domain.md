Claro! Abaixo está o **Documento Teórico de Domínio** para o **Auth Gateway**, formatado no mesmo padrão que o documento anterior do sistema de Filas (ACDG), com foco total em **Domain-Driven Design (DDD)**: **Bounded Contexts**, **Linguagem Ubíqua**, **Agregados**, **Invariantes**, **Eventos**, **Políticas**, **Projeções**, **Decisões** e **Regras de Negócio**.

---

# 📘 Documento de Domínio — **Auth Gateway** (`v0.1`)

> **Bounded Context:** *Auth Gateway*
> **Responsável por:** Identificação, Autenticação, Autorização e Decisão distribuída/offline para serviços internos
> **Posição arquitetural:** Upstream de todos os serviços internos, atua como **porteiro universal**.
> **Modo operacional:** `offline-first`, com tokens portáveis e decisões locais confiáveis

---

## ✳️ 1. Visão Geral

O **Auth Gateway** é o **Ponto Único de Decisão de Acesso** aos serviços internos da organização. Ele opera como **IdP (Identity Provider)** e **PDP (Policy Decision Point)**, responsável por:

* Identificar o usuário e associá-lo a um **contexto de execução (tenant, unidade, roles)**.
* Emitir artefatos de segurança: **tokens** (Access/Refresh) e **PST** (Policy Snapshot Token).
* Tomar decisões de autorização **online** ou permitir decisão **offline local (PEP)** com base em snapshot assinada.
* **Proteger a borda** e permitir que serviços sejam seguros mesmo em **modo degradado (sem conexão com Auth)**.

---

## 🗺️ 2. Bounded Contexts e Fronteiras

| Bounded Context               | Responsabilidade                                    | Integrações         |
| ----------------------------- | --------------------------------------------------- | ------------------- |
| **Auth Gateway (Core)**       | Sessões, tokens, PST, `/authorize`, JWKS, auditoria | OIDC/OAuth2         |
| **User Directory**            | Cadastro, roles, memberships, tenants               | Feed → Auth (ACL)   |
| **Access Control** *(futuro)* | Políticas customizadas por time/produto             | ACL em `/authorize` |
| **Serviços Consumidores**     | Utilizam tokens/PST para acesso e decisão           | Downstream          |

**Nota:** O Auth não "possui" o usuário — apenas consome projeções do Directory.

---

## 🗣️ 3. Linguagem Ubíqua (Glossário de Domínio)

| Termo                              | Definição                                                       |
| ---------------------------------- | --------------------------------------------------------------- |
| **Usuário (Subject)**              | Pessoa autenticada no sistema                                   |
| **Sessão**                         | Período autenticado com vínculo ao dispositivo/tenant           |
| **Token**                          | Access ou Refresh Token                                         |
| **PST (Policy Snapshot Token)**    | Snapshot assinada com contexto de políticas e identidade        |
| **PEP (Policy Enforcement Point)** | Decisor local (em cada serviço), usando PST                     |
| **PDP (Policy Decision Point)**    | Decisor central (`/authorize`)                                  |
| **Role**                           | Papel atribuído via Directory, usado para escopo de acesso      |
| **Scope**                          | Permissão granular, namespaced por serviço                      |
| **Tenant**                         | Escopo organizacional da identidade/autorização                 |
| **Unit**                           | Unidade ou equipe operacional                                   |
| **JWKS**                           | Chaves públicas para validação de tokens                        |
| **RevocationSet**                  | Conjunto de sessões/tokens revogados distribuído periodicamente |

---

## 🧱 4. Agregados e Entidades

### A1. **Session** (Agregado raiz)

```ts
Session {
  sessionId: UUID
  userId: SubjectID
  tenantId: TenantID
  issuedAt: Instant
  expiresAt: Instant
  deviceId?: DeviceID
  status: Active | Revoked | Expired
  authMethods: Set<Method>
}
```

**Invariantes:**

* Sessão pertence a **um tenant apenas**
* Sessão só é ativa entre `issuedAt ≤ now ≤ expiresAt`
* Sessão revogada é **imediatamente inválida** e idempotente
* Se `deviceId` presente, decisões offline requerem `cnf` (confirmation)

---

### A2. **Token** (Entidade acoplada à Sessão)

```ts
Token {
  tokenId: UUID
  sessionId: UUID
  type: Access | Refresh
  aud: AudienceID
  scopes: Set<Scope>
  exp: Instant
  revoked: boolean
  rotationCounter?: int
}
```

**Regras:**

* `AccessToken`: curta duração (~15min)
* `RefreshToken`: rotacionável, com replay protection (`rotationCounter`)
* `aud` define o serviço consumidor — validação obrigatória por downstream

---

### A3. **PolicySnapshot (PST)** (Entidade portável)

```ts
PolicySnapshot {
  pstId: UUID
  sessionId: UUID
  sub: SubjectID
  tenantId: TenantID
  roles: Set<Role>
  scopes: Set<Scope>
  aud: Set<AudienceID>
  unitIds?: Set<UnitID>
  deviceBinding: ConfirmationKey
  policyVersion: String
  nbf: Instant
  exp: Instant
}
```

**Invariantes:**

* PST é **assinado e verificável offline**
* Expira em até 48–72h (TTL)
* Device binding (`cnf`) obrigatório para modo offline
* Toda mudança de role ou política **invalida PSTs** na próxima emissão

---

### A4. **KeySet (JWKS)**

```ts
Key {
  kid: String
  alg: String
  activeFrom: Instant
  activeUntil?: Instant
}
```

**Regras:**

* Não reutilizar `kid`
* Rotação com overlap: 1 ativa, 1 reserva
* Compatível com validação distribuída e offline

---

### A5. **RevocationSet** (artefato distribuído)

* Coleção **compacta e assíncrona** de `sessionId` / `tokenId` inválidos
* Usada por PEPs locais para **verificação offline**
* Permite delta incremental e cache em borda

---

## 🔐 5. Regras de Negócio e Invariantes Globais

| Regra | Descrição                                                                                  |
| ----- | ------------------------------------------------------------------------------------------ |
| R1    | Um token **nunca pode conceder mais escopos** do que o `scope[]` e `aud` contidos          |
| R2    | Toda decisão com PST deve ser **determinística** (input → output) para uma `policyVersion` |
| R3    | Claims obrigatórias: `sub`, `tenantId`, `aud`, `exp`, `scope[]`, `jti`, `sessionId`        |
| R4    | PST expirada → negar acesso, exceto em `degraded window` configurável                      |
| R5    | Dados pessoais estendidos **não são armazenados** no Auth                                  |
| R6    | Tokens e PST são **self-contained**: sem chamadas ao Auth necessárias para validação       |

---

## 🔁 6. Políticas (Sagas/Decisores)

### P1. **Decisão Central (`/authorize`)**

* PDP verifica PST ou contexto de sessão/token
* Consulta política de acesso (RBAC + ABAC leve via claims)
* Retorna `allowed: true/false`, `reason`, `policyVersion`

### P2. **PEP local (offline)**

* Valida token ou PST com JWKS cache
* Aplica regras locais (via `scope`, `aud`, `unitIds`)
* Usa última `RevocationSet` disponível
* Em caso de expiração, aplica política de **modo degradado** (ex.: acesso leitura por 6h)

---

## 📡 7. Eventos de Domínio

| Evento                             | Uso                                 |
| ---------------------------------- | ----------------------------------- |
| `SessionCreated`                   | Registro de nova sessão             |
| `SessionRevoked`                   | Encerramento antecipado             |
| `TokenIssued`, `TokenRefreshed`    | Auditoria e rotação                 |
| `PSTIssued`, `PSTInvalidated`      | Controle e disseminação de snapshot |
| `KeyRotated`                       | Validação offline                   |
| `MembershipChanged`, `RoleGranted` | (via Directory) sincronização       |

---

## 🧭 8. Contratos OHS (Published Language)

| Endpoint                       | Descrição                            |
| ------------------------------ | ------------------------------------ |
| `/authorize`                   | Decisão de autorização (PDP central) |
| `/token`                       | Troca de código por token            |
| `/userinfo`                    | Perfil mínimo                        |
| `/introspect`                  | Validação de token                   |
| `/revocations`                 | Delta de tokens revogados            |
| `/pst/issue`                   | Emissão de PolicySnapshot            |
| `/jwks.json`                   | Chaves públicas ativas               |
| Discovery (`/.well-known/...`) | Metadados OIDC                       |

---

## 🔍 9. Projeções (Read Models internos)

* **UserAttributes**: dados mínimos de perfil (vindo do Directory)
* **Role→Scope Map**: relações de acesso
* **ServiceRegistry**: mapa de `audiences` e configurações de clients

> Todas derivadas. O Auth **não é dono** desses dados.

---

## 🧪 10. Estratégia de Testes (de domínio)

| Tipo              | Alvo                                                         |
| ----------------- | ------------------------------------------------------------ |
| **Unit**          | Regras de expiração, revogação, claims obrigatórias          |
| **Integration**   | Fluxos OAuth2, emissão PST, decisão `/authorize`             |
| **Contract/Pact** | OIDC Discovery, claims, compatibilidade de tokens            |
| **E2E**           | Sessão completa, revogação, fallback offline                 |
| **Resilience**    | Validação em modo degradado, rotação JWKS, rede indisponível |

---

## 📊 11. Projeções & Painéis (somente domínio da informação)

* **Admin Dashboard**: número de sessões ativas, tokens emitidos, decisões por `serviceId`, PST em uso
* **Logs de segurança**: revogações, tentativas inválidas, IPs suspeitos
* **Projeções por Serviço**: decisões allow/deny por escopo e `clientId`

---

## ⚠️ 12. Erros e Taxonomia

* **AuthN**: `invalid_credentials`, `mfa_required`, `account_locked`
* **AuthZ**: `insufficient_scope`, `tenant_mismatch`, `policy_denied`
* **Token**: `token_expired`, `token_revoked`, `invalid_signature`
* **Offline**: `pst_expired`, `revocation_data_stale`

---

## 🛡️ 13. Segurança e Auditoria

* **Criptografia**: tokens assinados (`RS256` ou `ES256`), chave rotacionada a cada 30 dias
* **Auditoria**: logs imutáveis, selados com timestamps do servidor
* **Revogação**: disponível online e como snapshot offline (delta incremental)
* **PII**: minimização; informações pessoais fora do token sempre que possível

---

## 🔄 14. Decisões de Design (ADRs resumidos)

| ADR   | Decisão                                               |
| ----- | ----------------------------------------------------- |
| D-001 | Usar RBAC + ABAC leve via claims (`unitIds`, `roles`) |
| D-002 | Tokens curtos + refresh com rotação                   |
| D-003 | PST com assinatura offline + device binding           |
| D-004 | Separar Auth e Directory (SLAs distintos)             |
| D-005 | Scopes namespaced (`service:verb.resource`)           |
| D-006 | JWKS com overlap → validação ininterrupta             |

---

## 📈 15. Métricas de Domínio

* % de decisões offline vs online (indicador de resiliência)
* Idade média dos PST utilizados na borda
* Latência p95 do `/authorize`
* Taxa de negação por tipo (`scope`, `aud`, `policy`)
* Quantidade de sessões revogadas ativamente

---

## 📦 16. MVP do Domínio

* Sessão com token Access/Refresh
* PST com assinatura, device-binding, escopos, roles
* PDP central (`/authorize`) e decisão offline local (PEP)
* JWKS publicado e cacheável
* RevocationSet distribuída
* Auditar tudo: sessão, token, PST, chave

---

## 🧩 17. Pontos em aberto / Futuro próximo

| Tema                            | Estado atual                         |
| ------------------------------- | ------------------------------------ |
| Politicas editáveis por produto | Fora do escopo (será Access Control) |
| Modo degradado granular         | Primeiras regras definidas           |
| Device enrollment               | Parcialmente implementado            |
| Chaves por tenant               | TBD (multi-tenant isolation)         |
| Assinatura ES256                | Implementação futura                 |

---

## ✅ Conclusão

O **Auth Gateway** consolida autenticação e autorização com forte isolamento de contexto (por tenant e serviço), operação resiliente (offline-first via PST) e decisões auditáveis.

Permite escalar a autorização de forma controlada com contratos explícitos (`/authorize`, `PST`, `userinfo`, `introspect`) e previsibilidade para consumidores.
