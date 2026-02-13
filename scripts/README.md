# Scripts - Conecta Social

Utilitários e automações do projeto.

---

## 📜 Scripts Disponíveis

### **🔐 load_secrets_from_bitwarden.py**

Carrega secrets do Bitwarden Secrets Manager e gera arquivo `.env` automaticamente.

**Uso:**
```bash
export BW_ACCESS_TOKEN="seu-token"
python3 scripts/load_secrets_from_bitwarden.py --env dev
```

**Opções:**
- `--env {dev,staging,prod}` - Ambiente (default: dev)
- `--output PATH` - Caminho do arquivo de saída (default: .env)
- `--dry-run` - Simula sem criar arquivo

**Exemplo:**
```bash
# Desenvolvimento
python3 scripts/load_secrets_from_bitwarden.py --env dev

# Testar sem criar arquivo
python3 scripts/load_secrets_from_bitwarden.py --env dev --dry-run

# Produção
python3 scripts/load_secrets_from_bitwarden.py --env prod --output .env.prod
```

**Configuração:**
Edite `SECRETS_MAP` no script para adicionar/atualizar IDs do Bitwarden.

**Requer:**
- `bws` CLI: `npm install -g @bitwarden/sdk-cli`
- `BW_ACCESS_TOKEN` como variável de ambiente

**Docs:** `handbook/process/bitwarden-secrets-manager.md`

---

### **📦 version.py**

Gerencia versionamento semântico do projeto usando `bun pm version`.

**Uso:**
```bash
python3 scripts/version.py {patch|minor|major|prerelease}
```

**Exemplos:**
```bash
# Incrementar patch (0.3.1 → 0.3.2)
python3 scripts/version.py patch

# Incrementar minor (0.3.1 → 0.4.0)
python3 scripts/version.py minor

# Incrementar major (0.3.1 → 1.0.0)
python3 scripts/version.py major

# Dry-run
python3 scripts/version.py patch --dry-run
```

**Docs:** `handbook/process/versioning.md`

---

### **🔄 sync_kanban_github.py**

Sincroniza `handbook/KANBAN.md` com GitHub Issues e Projects.

**Uso:**
```bash
# Via workflow (automático)
# Triggado por push em main quando KANBAN.md ou tasks/** mudam

# Manual
export GH_TOKEN="seu-github-token"
python3 scripts/sync_kanban_github.py \
  --repo acdgbrasil/conecta-social \
  --project-owner acdgbrasil \
  --project-number 10
```

**Opções:**
- `--repo OWNER/REPO` - Repositório GitHub
- `--project-owner OWNER` - Owner do GitHub Project
- `--project-number NUM` - Número do Project
- `--dry-run` - Simula sem alterar issues/project

**Workflow:** `.github/workflows/sync-kanban-project.yml`

---

## 🛠️ Padrões de Desenvolvimento

### **Python Scripts**

Todos os scripts seguem o padrão do projeto:

```python
#!/usr/bin/env python3
from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from typing import Sequence


@dataclass
class CliArgs:
    """Argumentos CLI"""
    # ...


def parse_args(argv: Sequence[str]) -> CliArgs:
    """Parse argumentos CLI"""
    # ...


def main(argv: Sequence[str]) -> int:
    """Entrypoint principal"""
    # ...
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
```

**Regras:**
- ✅ Type hints obrigatórios
- ✅ Dataclasses para estruturas
- ✅ Docstrings em funções principais
- ✅ Return codes claros (0 = sucesso, 1 = erro)
- ✅ Argumentos via `argparse`
- ✅ Shebang `#!/usr/bin/env python3`

---

## 📚 Referências

- **Versionamento:** `handbook/process/versioning.md`
- **Bitwarden:** `handbook/process/bitwarden-secrets-manager.md`
- **Workflows:** `.github/workflows/`
