# Bitwarden Secrets Manager - Guia de Integração

**Status:** ✅ Implementado  
**Última atualização:** 2026-02-11  
**Responsável:** Tech Lead (Orchestrator Agent)

---

## 🎯 Objetivo

Gerenciar **todas as secrets** do projeto de forma segura usando **Bitwarden Secrets Manager**, evitando armazenamento de credenciais diretamente no GitHub ou arquivos `.env` commitados.

---

## 🔐 Arquitetura de Segurança

```
┌─────────────────────────────────────────────────────────┐
│                 Bitwarden Secrets Manager               │
│                  (Vault Centralizado)                   │
│                                                          │
│  • SC_DB_USER                                           │
│  • SC_DB_PASSWORD                                       │
│  • SC_DB_NAME                                           │
│  • PROJECT_SYNC_TOKEN                                   │
│  • DISCORD_WEBHOOK_URL_PR                               │
│  • LOGTO_SECRET_VAULT_KEK                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ BW_ACCESS_TOKEN
                     │ (Machine Account)
                     ▼
┌─────────────────────────────────────────────────────────┐
│              GitHub Actions Workflows                    │
│                                                          │
│  • ci-dev-pr.yml        → DB credentials                │
│  • sync-kanban.yml      → PROJECT_SYNC_TOKEN            │
│  • notify-pr.yml        → DISCORD_WEBHOOK_URL_PR        │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Secrets Gerenciados

### **1. Database Credentials (PostgreSQL)**
| Secret | ID Bitwarden | Usado em |
|--------|--------------|----------|
| `SC_DB_USER` | `da849b99-fe62-496a-9357-b3e80047b6c1` | ci-dev-pr.yml |
| `SC_DB_PASSWORD` | `2773679e-367a-40e8-bbc5-b3e80047d48b` | ci-dev-pr.yml |
| `SC_DB_NAME` | `40250cc3-8ecf-4842-8d4f-b3e80047e968` | ci-dev-pr.yml |

### **2. Integration Tokens**
| Secret | ID Bitwarden | Usado em |
|--------|--------------|----------|
| `PROJECT_SYNC_TOKEN` | `393831c2-ddfc-4865-ad31-b3ee003a93d1` | sync-kanban-project.yml |
| `DISCORD_WEBHOOK_URL_PR` | `TBD` | notify-pr-discord.yml |

### **3. Infrastructure Secrets**
| Secret | ID Bitwarden | Usado em |
|--------|--------------|----------|
| `LOGTO_SECRET_VAULT_KEK` | `TBD` | docker-compose.yml (futuro) |
| `LOGTO_DB_USER` | `TBD` | docker-compose.yml (futuro) |
| `LOGTO_DB_PASSWORD` | `TBD` | docker-compose.yml (futuro) |

---

## 🚀 Setup Inicial (Primeira Vez)

### **Passo 1: Criar Machine Account no Bitwarden**

1. Acesse **Bitwarden Secrets Manager** (https://vault.bitwarden.com)
2. Navegue para **Settings** → **Machine Accounts**
3. Clique em **New Machine Account**
4. Configure:
   - **Name:** `Conecta Social CI/CD`
   - **Description:** `Machine account para GitHub Actions workflows`
5. Clique em **Create**

### **Passo 2: Criar Access Token**

1. Na tela do Machine Account criado, clique em **Access Tokens**
2. Clique em **New Access Token**
3. Configure:
   - **Name:** `GitHub Actions Token`
   - **Expires:** Nunca (ou 1 ano se política exigir rotação)
4. **IMPORTANTE:** Copie o token exibido (não será mostrado novamente)
5. Salve temporariamente em local seguro

### **Passo 3: Adicionar Token ao GitHub**

1. Acesse o repositório no GitHub
2. Vá em **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**
4. Configure:
   - **Name:** `BW_ACCESS_TOKEN`
   - **Secret:** Cole o token do Passo 2
5. Clique em **Add secret**

### **Passo 4: Criar Secrets no Bitwarden**

Para cada secret listada na seção "Secrets Gerenciados":

1. No Bitwarden, vá em **Secrets** → **New Secret**
2. Configure:
   - **Name:** Nome da secret (ex: `SC_DB_USER`)
   - **Value:** Valor real da secret
   - **Project:** Associe ao projeto "Conecta Social"
3. **IMPORTANTE:** Copie o **Secret ID** (UUID gerado)
4. Dê permissão ao Machine Account:
   - Vá em **Machine Accounts** → `Conecta Social CI/CD`
   - Em **Secrets**, adicione a secret criada
   - Permissão: **Read**

### **Passo 5: Atualizar IDs nos Workflows**

Edite os workflows em `.github/workflows/*.yml` e substitua os IDs de exemplo pelos IDs reais copiados no Passo 4.

**Exemplo (`ci-dev-pr.yml`):**
```yaml
- name: Get Secrets from Bitwarden
  uses: bitwarden/sm-action@v2
  with:
    access_token: ${{ secrets.BW_ACCESS_TOKEN }}
    secrets: |
      <SEU_ID_REAL_AQUI> > SC_DB_USER
      <SEU_ID_REAL_AQUI> > SC_DB_PASSWORD
      <SEU_ID_REAL_AQUI> > SC_DB_NAME
```

---

## 📖 Como Usar em Workflows

### **Template Básico**

```yaml
- name: Get Secrets from Bitwarden
  uses: bitwarden/sm-action@v2
  with:
    access_token: ${{ secrets.BW_ACCESS_TOKEN }}
    secrets: |
      <SECRET_ID_1> > SECRET_NAME_1
      <SECRET_ID_2> > SECRET_NAME_2

- name: Use Secret
  run: |
    echo "Usando secret: $SECRET_NAME_1"
  env:
    MY_VAR: ${{ env.SECRET_NAME_1 }}
```

### **Self-Hosted (Opcional)**

Se usar Bitwarden self-hosted:

```yaml
- name: Get Secrets from Bitwarden
  uses: bitwarden/sm-action@v2
  with:
    access_token: ${{ secrets.BW_ACCESS_TOKEN }}
    base_url: https://vault.sua-empresa.com
    secrets: |
      <SECRET_ID> > SECRET_NAME
```

---

## 💻 Uso em Desenvolvimento Local

### **Instalação do Bitwarden CLI**

```bash
# NPM (recomendado)
npm install -g @bitwarden/sdk-cli

# Homebrew (macOS)
brew install bitwarden-cli

# Verificar instalação
bws --version
```

### **Configurar Access Token**

```bash
# Export token do Machine Account (mesmo do GitHub)
export BW_ACCESS_TOKEN="seu-token-do-machine-account"

# Opcional: Adicionar ao ~/.zshrc ou ~/.bashrc para persistir
echo 'export BW_ACCESS_TOKEN="seu-token"' >> ~/.zshrc
```

### **Gerar arquivo .env**

```bash
# Gerar .env para desenvolvimento
python3 scripts/load_secrets_from_bitwarden.py --env dev

# Dry-run (apenas testar, sem criar arquivo)
python3 scripts/load_secrets_from_bitwarden.py --env dev --dry-run

# Gerar para ambiente específico
python3 scripts/load_secrets_from_bitwarden.py --env staging --output .env.staging
python3 scripts/load_secrets_from_bitwarden.py --env prod --output .env.prod
```

### **Verificar e usar**

```bash
# Verificar conteúdo gerado
cat .env

# Iniciar servidor
bun run dev

# Iniciar infraestrutura
bun run infra:up
```

**⚠️ IMPORTANTE:**
- O script substitui completamente o arquivo `.env` existente
- Faça backup se tiver configurações customizadas
- Certifique-se de que `.env` está no `.gitignore`

---

## 🔄 Workflows Atuais

### **1. ci-dev-pr.yml**
**Função:** CI/validação em Pull Requests  
**Secrets usados:**
- `SC_DB_USER` - Usuário PostgreSQL para testes
- `SC_DB_PASSWORD` - Senha PostgreSQL
- `SC_DB_NAME` - Nome do banco de testes

**Implementação:**
```yaml
- name: Get Secrets from Bitwarden
  uses: bitwarden/sm-action@v2
  with:
    access_token: ${{ secrets.BW_ACCESS_TOKEN }}
    secrets: |
      da849b99-fe62-496a-9357-b3e80047b6c1 > SC_DB_USER
      2773679e-367a-40e8-bbc5-b3e80047d48b > SC_DB_PASSWORD
      40250cc3-8ecf-4842-8d4f-b3e80047e968 > SC_DB_NAME
```

### **2. sync-kanban-project.yml**
**Função:** Sincroniza KANBAN.md com GitHub Project  
**Secrets usados:**
- `PROJECT_SYNC_TOKEN` - Token GitHub com permissões de project/issues

**Implementação:**
```yaml
- name: Get Secrets from Bitwarden
  uses: bitwarden/sm-action@v2
  with:
    access_token: ${{ secrets.BW_ACCESS_TOKEN }}
    secrets: |
      393831c2-ddfc-4865-ad31-b3ee003a93d1 > PROJECT_SYNC_TOKEN
```

### **3. notify-pr-discord.yml**
**Função:** Notifica PRs no Discord  
**Secrets usados:**
- `DISCORD_WEBHOOK_URL_PR` - URL webhook Discord

**Status:** ⚠️ Precisa criar secret no Bitwarden

### **4. perf-benchmarks.yml**
**Função:** Benchmarks de performance  
**Secrets usados:** Nenhum (read-only)

---

## 🔒 Boas Práticas de Segurança

### **✅ Fazer**
- ✅ Rotacionar `BW_ACCESS_TOKEN` a cada 6-12 meses
- ✅ Usar Machine Accounts dedicados por ambiente (dev/staging/prod)
- ✅ Dar apenas permissões **Read** para secrets em CI/CD
- ✅ Validar presença de secrets antes de usar (`if [ -z "$VAR" ]`)
- ✅ Mascarar secrets em logs (GitHub faz automaticamente)
- ✅ Documentar IDs de secrets neste arquivo

### **❌ Não Fazer**
- ❌ Commitar `BW_ACCESS_TOKEN` no código
- ❌ Compartilhar access tokens entre projetos
- ❌ Dar permissões **Write** desnecessárias
- ❌ Logar valores de secrets (use `echo "***"` ao debugar)
- ❌ Usar secrets em branches públicos/forks (GitHub bloqueia por padrão)

---

## 🧪 Testando Integração

### **Teste Local (Simulação)**

Não é possível testar Bitwarden localmente sem acesso ao token. Use `.env` local para desenvolvimento.

### **Teste no GitHub Actions**

1. Crie uma branch de teste
2. Force um workflow run:
   ```bash
   git commit --allow-empty -m "test: Validar Bitwarden integration"
   git push origin test-bitwarden
   ```
3. Abra um PR para trigger `ci-dev-pr.yml`
4. Verifique logs:
   - ✅ `Get Secrets from Bitwarden` deve passar
   - ✅ Secrets devem aparecer como `***` nos logs
   - ❌ Se falhar, verifique IDs e permissões do Machine Account

---

## 🐛 Troubleshooting

### **Erro: "Access token is invalid"**
- Verifique se `BW_ACCESS_TOKEN` está salvo corretamente no GitHub
- Confirme que o token não expirou
- Regenere o token se necessário

### **Erro: "Secret not found"**
- Verifique se o Secret ID está correto
- Confirme que o Machine Account tem permissão **Read** na secret
- Certifique-se de que a secret está associada ao projeto correto

### **Erro: "Machine account does not have access"**
- Vá em Bitwarden → Machine Accounts → `Conecta Social CI/CD`
- Adicione a secret manualmente com permissão **Read**

### **Secret aparece vazia no workflow**
- Confirme que o nome da secret no workflow corresponde ao mapeamento:
  ```yaml
  secrets: |
    <ID_CORRETO> > NOME_ESPERADO  # ← Use este nome no env
  ```

---

## 📊 Inventário de Secrets (Checklist)

### **Produção**
- [ ] `SC_DB_USER` (ID: `TBD`)
- [ ] `SC_DB_PASSWORD` (ID: `TBD`)
- [ ] `SC_DB_NAME` (ID: `TBD`)
- [ ] `LOGTO_SECRET_VAULT_KEK` (ID: `TBD`)
- [ ] `LOGTO_DB_USER` (ID: `TBD`)
- [ ] `LOGTO_DB_PASSWORD` (ID: `TBD`)
- [ ] `LOGTO_DB_NAME` (ID: `TBD`)

### **CI/CD**
- [x] `BW_ACCESS_TOKEN` (GitHub Secret - configurado)
- [x] `SC_DB_USER` (ID: `da849b99-fe62-496a-9357-b3e80047b6c1`)
- [x] `SC_DB_PASSWORD` (ID: `2773679e-367a-40e8-bbc5-b3e80047d48b`)
- [x] `SC_DB_NAME` (ID: `40250cc3-8ecf-4842-8d4f-b3e80047e968`)
- [x] `PROJECT_SYNC_TOKEN` (ID: `393831c2-ddfc-4865-ad31-b3ee003a93d1`)
- [ ] `DISCORD_WEBHOOK_URL_PR` (ID: `TBD`)

---

## 🚀 Próximos Passos

1. **Criar secrets faltantes:**
   - `DISCORD_WEBHOOK_URL_PR`
   - Secrets de produção (Logto, DB prod)

2. **Implementar em Docker Compose:**
   - Criar script para injetar secrets via Bitwarden em deploy
   - Evitar `.env` em produção

3. **Rotação automática:**
   - Configurar alertas de expiração no Bitwarden
   - Script de rotação de credenciais DB

4. **Multi-ambiente:**
   - Criar Machine Accounts separados para staging/prod
   - Segregar secrets por ambiente

---

## 📚 Referências

- [Bitwarden GitHub Actions Integration](https://bitwarden.com/help/github-actions-integration/)
- [Bitwarden Machine Accounts](https://bitwarden.com/help/machine-accounts/)
- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Bitwarden sm-action@v2](https://github.com/marketplace/actions/bitwarden-secrets-manager)

---

**Manutenção:** Este documento deve ser atualizado sempre que:
- Novos secrets forem criados
- IDs de secrets mudarem
- Machine Accounts forem recriados
- Workflows novos forem adicionados
