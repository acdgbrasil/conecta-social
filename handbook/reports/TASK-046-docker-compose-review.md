# Docker Compose - Code Review & Melhorias

**Data:** 2026-02-11  
**Reviewer:** Orchestrator Agent (PostgreSQL Ops + DevOps Specialist)  
**Arquivo:** `docker-compose.yml`

---

## 🎯 Sumário Executivo

**Problemas Encontrados:** 14 issues  
- 🔴 **Críticos:** 4 (BLOQUEIAM PRODUÇÃO)
- 🟡 **Médios:** 5 (Altamente recomendados)
- 🟢 **Baixos:** 5 (Melhorias incrementais)

---

## 🔴 Críticos (MUST FIX)

### 1. **Portas Expostas em 0.0.0.0 (Internet Pública)**

**Problema:**
```yaml
ports:
  - "5433:5432"  # ❌ Exposto em TODAS as interfaces
```

**Risco:**
- PostgreSQL acessível da internet
- Brute-force attacks
- **Violação LGPD/GDPR**

**Correção:**
```yaml
ports:
  - "127.0.0.1:5433:5432"  # ✅ Apenas localhost
```

---

### 2. **Credenciais Vazando em Healthchecks**

**Problema:**
```yaml
healthcheck:
  test: ["CMD", "pg_isready", "-U", "${SC_DB_USER:?...}"]
  # ❌ Variáveis aparecem em logs/inspect
```

**Correção:**
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER || exit 1"]
  # ✅ Usa variáveis internas do container
```

---

### 3. **Containers Rodando como Root**

**Risco:**
- Container escape = root no host
- Privilege escalation

**Correção:**
```yaml
social-care-db:
  user: "999:999"  # postgres user
  security_opt:
    - no-new-privileges:true
  cap_drop:
    - ALL
  cap_add:
    - CHOWN
    - DAC_OVERRIDE
    - SETGID
    - SETUID
```

---

### 4. **Ausência de Resource Limits**

**Risco:**
- 1 container pode derrubar o host
- OOM killer randômico

**Correção:**
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

---

## 🟡 Médios (Recomendados)

### 5. PostgreSQL Sem Tuning
### 6. Healthcheck Muito Agressivo (5s → 30s)
### 7. Logto Sem Healthcheck
### 8. Restart Policy Perigosa (`always` → `unless-stopped`)
### 9. Falta Read-Only Root Filesystem

---

## 🟢 Baixos (Melhorias)

### 10. Logging Estruturado
### 11. Timezone/Locale
### 12. Network Subnet Customizada
### 13. Volumes Sem Labels
### 14. Init Process (PID 1)

---

## 📋 Plano de Correção

### **Fase 1: Bloqueadores (Hoje)**
- [ ] Bind portas em localhost (`127.0.0.1:`)
- [ ] Corrigir healthchecks (usar `$$POSTGRES_USER`)
- [ ] Adicionar user não-root
- [ ] Configurar resource limits

### **Fase 2: Estabilidade (Esta semana)**
- [ ] Tuning PostgreSQL
- [ ] Ajustar healthcheck intervals
- [ ] Healthcheck do Logto
- [ ] Mudar restart policy

### **Fase 3: Hardening (Próxima sprint)**
- [ ] Read-only filesystem
- [ ] Logging estruturado
- [ ] Network customizada
- [ ] Volume labels

---

## 🚀 Implementação Recomendada

Vou criar um `docker-compose.prod.yml` otimizado em arquivo separado para review.

