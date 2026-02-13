# Docker Compose - Guia de Correções

**Referência:** Code Review completo em `handbook/reports/TASK-046-docker-compose-review.md`

---

## 🔴 **CORREÇÕES CRÍTICAS** (Bloqueiam Produção)

### 1. Portas em Localhost (Linha 14, 35, 61-62)

**❌ Atual:**
```yaml
ports:
  - "5433:5432"  # Exposto em 0.0.0.0 (TODAS as interfaces)
  - "5434:5432"
  - "3001:3001"
  - "3002:3002"
```

**✅ Correto:**
```yaml
ports:
  - "127.0.0.1:5433:5432"  # Apenas localhost
  - "127.0.0.1:5434:5432"
  - "127.0.0.1:3001:3001"
  - "127.0.0.1:3002:3002"
```

**Por quê:** Evita exposição de bancos de dados e serviços na internet pública.

---

### 2. Healthchecks Seguros (Linha 20, 41)

**❌ Atual:**
```yaml
healthcheck:
  test: ["CMD", "pg_isready", "-U", "${SC_DB_USER:?...}", "-d", "${SC_DB_NAME:?...}"]
  interval: 5s
  timeout: 5s
  retries: 5
```

**✅ Correto:**
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB || exit 1"]
  interval: 30s
  timeout: 3s
  retries: 3
  start_period: 40s
```

**Mudanças:**
- `$$POSTGRES_USER` → Usa variável interna (não vaza em logs)
- `interval: 30s` → Reduz overhead (era 5s)
- `start_period: 40s` → Dá tempo pro Postgres iniciar

---

### 3. User Não-Root (Adicionar em todos os serviços)

**✅ Adicionar:**
```yaml
social-care-db:
  image: postgres:17-alpine
  user: "999:999"  # postgres user no alpine
  security_opt:
    - no-new-privileges:true
  cap_drop:
    - ALL
  cap_add:
    - CHOWN
    - DAC_OVERRIDE
    - SETGID
    - SETUID
  # ... resto da config
```

**Por quê:** Container escape não dá root no host.

---

### 4. Resource Limits (Adicionar em todos os serviços)

**✅ Adicionar:**
```yaml
social-care-db:
  deploy:
    resources:
      limits:
        cpus: '2.0'
        memory: 1G
      reservations:
        cpus: '0.5'
        memory: 512M
  # ... resto da config

logto-db:
  deploy:
    resources:
      limits:
        cpus: '1.0'
        memory: 512M
      reservations:
        cpus: '0.25'
        memory: 256M

logto:
  deploy:
    resources:
      limits:
        cpus: '1.0'
        memory: 512M
      reservations:
        cpus: '0.25'
        memory: 256M
```

**Por quê:** Evita que um container derrube o host.

---

## 🟡 **MELHORIAS RECOMENDADAS**

### 5. Tuning PostgreSQL

**✅ Adicionar:**
```yaml
social-care-db:
  command:
    - "postgres"
    - "-c"
    - "shared_buffers=256MB"
    - "-c"
    - "effective_cache_size=1GB"
    - "-c"
    - "max_connections=200"
    - "-c"
    - "work_mem=4MB"
    - "-c"
    - "maintenance_work_mem=64MB"
    - "-c"
    - "random_page_cost=1.1"
    - "-c"
    - "effective_io_concurrency=200"
    - "-c"
    - "wal_buffers=16MB"
    - "-c"
    - "checkpoint_completion_target=0.9"
    - "-c"
    - "max_wal_size=1GB"
    - "-c"
    - "log_min_duration_statement=200"
  # ... resto da config
```

**Benefício:** Performance 5-10x melhor.

---

### 6. Healthcheck do Logto (Linha 47-67)

**✅ Adicionar:**
```yaml
logto:
  healthcheck:
    test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3001/api/health"]
    interval: 30s
    timeout: 5s
    retries: 3
    start_period: 30s
  # ... resto da config
```

---

### 7. Restart Policy Segura (Linha 7, 29, 50)

**❌ Atual:**
```yaml
restart: always
```

**✅ Melhor:**
```yaml
restart: unless-stopped
```

**Ou com limite:**
```yaml
deploy:
  restart_policy:
    condition: on-failure
    delay: 5s
    max_attempts: 3
    window: 120s
```

---

### 8. Read-Only Filesystem

**✅ Adicionar:**
```yaml
social-care-db:
  read_only: true
  tmpfs:
    - /tmp
    - /var/run/postgresql
  # ... resto da config
```

**Benefício:** Impede malware persistence.

---

## 🟢 **MELHORIAS INCREMENTAIS**

### 9. Logging Estruturado

```yaml
social-care-db:
  logging:
    driver: "json-file"
    options:
      max-size: "10m"
      max-file: "3"
  labels:
    com.conecta.service: "social-care-db"
    com.conecta.context: "social-care"
```

---

### 10. Timezone & Locale

```yaml
environment:
  # ... vars existentes
  TZ: America/Sao_Paulo
  PGTZ: America/Sao_Paulo
  LC_ALL: pt_BR.UTF-8
  LANG: pt_BR.UTF-8
```

---

### 11. Network Customizada (Linha 76-77)

```yaml
networks:
  conecta-internal-net:
    driver: bridge
    ipam:
      driver: default
      config:
        - subnet: 172.28.0.0/16
          gateway: 172.28.0.1
```

---

### 12. Init Process

```yaml
social-care-db:
  init: true  # Adiciona tini como PID 1
```

---

## 📋 **Checklist de Implementação**

### Fase 1: Críticos (Hoje)
- [ ] Bind portas em `127.0.0.1:`
- [ ] Corrigir healthchecks (usar `$$POSTGRES_USER`)
- [ ] Adicionar `user: "999:999"` e `security_opt`
- [ ] Configurar `deploy.resources`

### Fase 2: Recomendados (Esta semana)
- [ ] Tuning PostgreSQL (`command:`)
- [ ] Ajustar healthcheck intervals (5s → 30s)
- [ ] Adicionar healthcheck do Logto
- [ ] Mudar `restart: unless-stopped`
- [ ] Read-only filesystem

### Fase 3: Melhorias (Próxima sprint)
- [ ] Logging estruturado
- [ ] Timezone/locale
- [ ] Network customizada
- [ ] Init process
- [ ] Volume labels

---

## 🧪 **Como Testar**

### Após Correções Críticas:

```bash
# 1. Validar sintaxe
docker-compose config

# 2. Verificar portas (devem estar em 127.0.0.1)
docker-compose config | grep -A2 "ports:"

# 3. Testar startup
docker-compose up -d

# 4. Verificar healthchecks
docker ps --format "table {{.Names}}\t{{.Status}}"

# 5. Verificar resource limits
docker stats --no-stream

# 6. Testar conexão local
psql -h 127.0.0.1 -p 5433 -U $SC_DB_USER -d $SC_DB_NAME

# 7. Garantir que NÃO é acessível externamente
# (De outra máquina na rede, deve falhar)
psql -h <IP_PUBLICO_DO_HOST> -p 5433  # ❌ Deve falhar
```

---

## 🎯 **Prioridades**

**Deploy Hoje (Mínimo Viável):**
1. Portas em localhost
2. Healthchecks seguros
3. Resource limits

**Deploy Esta Semana (Produção):**
- Tudo acima +
4. User não-root
5. Tuning PostgreSQL
6. Healthcheck Logto

**Otimização Contínua:**
- Tudo acima +
7. Read-only filesystem
8. Logging estruturado
9. Melhorias incrementais

---

**Relatório Completo:** `handbook/reports/TASK-046-docker-compose-review.md`
