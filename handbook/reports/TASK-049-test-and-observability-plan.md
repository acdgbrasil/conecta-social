# Roles & Permissions - Plano de Testes e Observabilidade

**Data:** 2026-02-13

---

## Estratégia de Testes

### 1. Unitários

1. `AuthPort.validateToken`:
- token válido
- token expirado
- assinatura inválida
- issuer/audience inválidos

2. `hasScopes`:
- match completo
- match parcial
- sem scopes

3. middleware `authn`/`authz`:
- sem header -> 401
- token inválido -> 401
- token válido sem scope -> 403
- token válido com scope -> 2xx

---

### 2. Integração HTTP

1. Rotas de Social Care bloqueadas sem token.
2. Rotas bloqueadas com token de role inadequada.
3. Rotas liberadas com role adequada.
4. Regressão de webhook do Logto (continua funcional, assinatura válida).

---

### 3. E2E com Logto (ambiente de teste)

1. Usuário `VISITOR` sem acesso a mutações de Social Care.
2. Usuário `ASSISTANT_SOCIAL` com acesso completo ao módulo.
3. M2M sem scopes de usuário final não acessa endpoints protegidos.

---

## Matriz de Casos de Segurança

1. Token replay (curta janela + validação de exp).
2. Escopo forjado no cliente (deve ser rejeitado na validação de assinatura).
3. Tentativas massivas de acesso negado (rate/alert).
4. IDOR: `personId` divergente entre token e payload deve ser bloqueado quando aplicável.

---

## Observabilidade Mínima

### Logs estruturados

Campos obrigatórios por requisição autorizada/negada:

1. `request_id`
2. `path`
3. `method`
4. `status_code`
5. `sub`
6. `person_id` (quando existir)
7. `required_scopes`
8. `granted_scopes`
9. `decision` (`allow`/`deny`)

### Métricas

1. `auth_requests_total` (por endpoint)
2. `auth_denied_total` (401 e 403 separados)
3. `auth_denied_by_scope_total`
4. latência média da validação JWT

### Alertas

1. aumento súbito de 403 em endpoint crítico
2. falha contínua de validação de token
3. uso inesperado de credenciais M2M em rotas de usuário

---

## Gates de CI recomendados

1. Job de testes de autorização obrigatório em PR.
2. Fail do pipeline ao detectar rota nova sem policy declarada.
3. Artifact com relatório de matriz `endpoint -> scope` gerado automaticamente.

---

## Definição de Pronto (DoR/DoD)

### DoR

1. Scope do endpoint definido e aprovado.
2. Casos de 401/403 descritos.

### DoD

1. Testes unitários + integração passando.
2. Logs/metrics emitidos para allow e deny.
3. Documentação do endpoint atualizada com scope obrigatório.
