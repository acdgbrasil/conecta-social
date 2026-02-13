# Bitwarden Secrets - Referência Rápida

**📖 Guia completo:** `handbook/process/bitwarden-secrets-manager.md`

---

## 🔑 GitHub Secret Obrigatório

```bash
BW_ACCESS_TOKEN  # Salvo em: GitHub Settings → Secrets → Actions
```

---

## 📋 Secrets Atuais (IDs Bitwarden)

### **CI/CD (GitHub Actions)**
```yaml
# Database Credentials
da849b99-fe62-496a-9357-b3e80047b6c1 > SC_DB_USER
2773679e-367a-40e8-bbc5-b3e80047d48b > SC_DB_PASSWORD
40250cc3-8ecf-4842-8d4f-b3e80047e968 > SC_DB_NAME

# Integration Tokens
393831c2-ddfc-4865-ad31-b3ee003a93d1 > PROJECT_SYNC_TOKEN
TBD > DISCORD_WEBHOOK_URL_PR
```

### **Desenvolvimento Local**
```yaml
# Database Social Care
da849b99-fe62-496a-9357-b3e80047b6c1 > SC_DB_USER
2773679e-367a-40e8-bbc5-b3e80047d48b > SC_DB_PASSWORD
40250cc3-8ecf-4842-8d4f-b3e80047e968 > SC_DB_NAME

# Database Logto
TBD > LOGTO_DB_USER
TBD > LOGTO_DB_PASSWORD
TBD > LOGTO_DB_NAME

# Logto Secrets
TBD > LOGTO_SECRET_VAULT_KEK
```

### **Produção (Docker/Deploy)**
```yaml
TBD > SC_DB_USER (prod)
TBD > SC_DB_PASSWORD (prod)
TBD > SC_DB_NAME (prod)
TBD > LOGTO_SECRET_VAULT_KEK (prod)
TBD > LOGTO_DB_USER (prod)
TBD > LOGTO_DB_PASSWORD (prod)
TBD > LOGTO_DB_NAME (prod)
```

---

## 🐍 Script Python (Desenvolvimento Local)

```bash
# 1. Export access token
export BW_ACCESS_TOKEN="seu-token-aqui"

# 2. Gerar .env com secrets
python3 scripts/load_secrets_from_bitwarden.py --env dev

# 3. Dry-run (testar sem gerar arquivo)
python3 scripts/load_secrets_from_bitwarden.py --env dev --dry-run

# 4. Produção (gerar .env.prod)
python3 scripts/load_secrets_from_bitwarden.py --env prod --output .env.prod
```

**Requer:** `npm install -g @bitwarden/sdk-cli`

---

## 🚀 Usar em Workflow

```yaml
- name: Get Secrets
  uses: bitwarden/sm-action@v2
  with:
    access_token: ${{ secrets.BW_ACCESS_TOKEN }}
    secrets: |
      <SECRET_ID> > SECRET_NAME

- name: Use Secret
  run: echo "Value: $SECRET_NAME"
  env:
    MY_VAR: ${{ env.SECRET_NAME }}
```

---

## ✅ Checklist Nova Secret

1. [ ] Criar secret no Bitwarden Secrets Manager
2. [ ] Copiar Secret ID (UUID)
3. [ ] Dar permissão **Read** ao Machine Account "Conecta Social CI/CD"
4. [ ] Atualizar workflow com o ID
5. [ ] Atualizar `handbook/process/bitwarden-secrets-manager.md`
6. [ ] Atualizar este arquivo de referência

---

## 🔒 Segurança

- ✅ **Nunca** commite `BW_ACCESS_TOKEN`
- ✅ Rotacione token a cada 6-12 meses
- ✅ Use apenas permissões **Read** em CI/CD
- ✅ Valide presença antes de usar: `if [ -z "$VAR" ]; then exit 1; fi`

---

## 🐛 Troubleshooting

| Erro | Solução |
|------|---------|
| "Access token invalid" | Regenere token em Bitwarden |
| "Secret not found" | Verifique ID e permissões do Machine Account |
| Secret vazia | Confirme mapeamento `<ID> > NOME_CORRETO` |

---

**Última atualização:** 2026-02-11
