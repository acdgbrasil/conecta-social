#!/usr/bin/env python3
"""
Carrega secrets do Bitwarden Secrets Manager e gera arquivo .env

Requer:
    - Bitwarden CLI (bws): npm install -g @bitwarden/sdk-cli
    - BW_ACCESS_TOKEN definido como variável de ambiente

Uso:
    export BW_ACCESS_TOKEN="seu-token-aqui"
    python3 scripts/load_secrets_from_bitwarden.py --env dev --output .env
    python3 scripts/load_secrets_from_bitwarden.py --env prod --output .env.prod
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Sequence


class Environment(str, Enum):
    """Ambientes suportados"""

    DEV = "dev"
    STAGING = "staging"
    PROD = "prod"


@dataclass
class SecretMapping:
    """Mapeamento entre variável .env e ID do Bitwarden"""

    env_var: str
    bitwarden_id: str
    required: bool = True
    description: str = ""


# ============================================================================
# CONFIGURAÇÃO DE SECRETS (Bitwarden IDs)
# ============================================================================
# ⚠️  Atualize os IDs com valores reais do seu Bitwarden Secrets Manager
# ============================================================================

SECRETS_MAP: dict[Environment, list[SecretMapping]] = {
    Environment.DEV: [
        # Database Social Care
        SecretMapping(
            env_var="SC_DB_USER",
            bitwarden_id="9c5a931e-9fcf-4817-b172-b3f0005666c4",
            description="Usuário PostgreSQL Social Care",
        ),
        SecretMapping(
            env_var="SC_DB_PASSWORD",
            bitwarden_id="70a8c524-eb0a-4445-a727-b3f000567938",
            description="Senha PostgreSQL Social Care",
        ),
        SecretMapping(
            env_var="SC_DB_NAME",
            bitwarden_id="45fbd2b8-ff01-4a80-97c4-b3f0005686f1",
            description="Nome database Social Care",
        ),
        # Logto Database
        SecretMapping(
            env_var="LOGTO_DB_USER",
            bitwarden_id="5d8afa20-b076-4a3b-9700-b3f000569356",
            description="Usuário PostgreSQL Logto",
        ),
        SecretMapping(
            env_var="LOGTO_DB_PASSWORD",
            bitwarden_id="c90805b0-af63-4df5-964c-b3f00056a0bc",
            description="Senha PostgreSQL Logto",
        ),
        SecretMapping(
            env_var="LOGTO_DB_NAME",
            bitwarden_id="67b4b209-fa3d-4393-8471-b3f00056ad34",
            description="Nome database Logto",
        ),
        # Logto Secrets
        SecretMapping(
            env_var="LOGTO_SECRET_VAULT_KEK",
            bitwarden_id="ee00b47a-ecc9-4c02-999d-b3f00056bce2",
            description="Chave criptográfica Logto Vault",
        ),
        SecretMapping(
            env_var="LOGTO_WEBHOOK_SECRET",
            bitwarden_id="85bed834-1505-4666-abc2-b3f00056ce1b",
            description="Segredo de validação webhook do Logto",
        ),
        SecretMapping(
            env_var="LOGTO_M2M_APP_ID",
            bitwarden_id="dc4b0741-f60d-4f82-bf26-b3f00056d9d8",
            description="App ID (Client ID) da aplicação M2M do Logto",
        ),
        SecretMapping(
            env_var="LOGTO_M2M_APP_SECRET",
            bitwarden_id="8a4a631a-fbaa-46ed-aa7a-b3f00056e376",
            description="App Secret (Client Secret) da aplicação M2M do Logto",
        ),
    ],
    Environment.STAGING: [
        SecretMapping(
            env_var="SC_DB_USER",
            bitwarden_id="ac46c509-389d-465f-b3b8-b3f000571b66",
            description="Usuário PostgreSQL Social Care",
        ),
        SecretMapping(
            env_var="SC_DB_PASSWORD",
            bitwarden_id="c0ad6057-d8a5-4369-817b-b3f00057240f",
            description="Senha PostgreSQL Social Care",
        ),
        SecretMapping(
            env_var="SC_DB_NAME",
            bitwarden_id="b2e21913-69af-406d-aec4-b3f000572cd2",
            description="Nome database Social Care",
        ),
        # Logto Database
        SecretMapping(
            env_var="LOGTO_DB_USER",
            bitwarden_id="0f5d839d-8014-4e9c-9b98-b3f000573683",
            description="Usuário PostgreSQL Logto",
        ),
        SecretMapping(
            env_var="LOGTO_DB_PASSWORD",
            bitwarden_id="578656fd-2d9b-4fed-b261-b3f000573f12",
            description="Senha PostgreSQL Logto",
        ),
        SecretMapping(
            env_var="LOGTO_DB_NAME",
            bitwarden_id="37c2fafa-c4ce-4c76-b2cd-b3f000574779",
            description="Nome database Logto",
        ),
        # Logto Secrets
        SecretMapping(
            env_var="LOGTO_SECRET_VAULT_KEK",
            bitwarden_id="79f706ad-393b-4214-827c-b3f000574ef6",
            description="Chave criptográfica Logto Vault",
        ),
        SecretMapping(
            env_var="LOGTO_WEBHOOK_SECRET",
            bitwarden_id="5006bab7-1782-41aa-8467-b3f000575761",
            description="Segredo de validação webhook do Logto",
        ),
        SecretMapping(
            env_var="LOGTO_M2M_APP_ID",
            bitwarden_id="c69b0fd4-555d-4ae9-b1fd-b3f000575fa9",
            description="App ID (Client ID) da aplicação M2M do Logto",
        ),
        SecretMapping(
            env_var="LOGTO_M2M_APP_SECRET",
            bitwarden_id="6d4d5e0c-4256-4dbc-9faa-b3f0005767fc",
            description="App Secret (Client Secret) da aplicação M2M do Logto",
        ),
    ],
    Environment.PROD: [
        SecretMapping(
            env_var="SC_DB_USER",
            bitwarden_id="0848995f-68d4-4b4a-ad77-b3f000577a5a",
            description="Usuário PostgreSQL Social Care",
        ),
        SecretMapping(
            env_var="SC_DB_PASSWORD",
            bitwarden_id="f97c97a1-08ce-4fae-9e89-b3f000578392",
            description="Senha PostgreSQL Social Care",
        ),
        SecretMapping(
            env_var="SC_DB_NAME",
            bitwarden_id="900d1a17-a62a-4a08-b81b-b3f000578b42",
            description="Nome database Social Care",
        ),
        # Logto Database
        SecretMapping(
            env_var="LOGTO_DB_USER",
            bitwarden_id="b039dfd0-c4bd-40d1-a145-b3f0005792cd",
            description="Usuário PostgreSQL Logto",
        ),
        SecretMapping(
            env_var="LOGTO_DB_PASSWORD",
            bitwarden_id="6921c3eb-0d3b-4782-9f57-b3f000579c6d",
            description="Senha PostgreSQL Logto",
        ),
        SecretMapping(
            env_var="LOGTO_DB_NAME",
            bitwarden_id="00bfd050-74d2-4525-b1b7-b3f00057a3b5",
            description="Nome database Logto",
        ),
        # Logto Secrets
        SecretMapping(
            env_var="LOGTO_SECRET_VAULT_KEK",
            bitwarden_id="d4e5b96a-c67e-4446-8761-b3f00057ac01",
            description="Chave criptográfica Logto Vault",
        ),
        SecretMapping(
            env_var="LOGTO_WEBHOOK_SECRET",
            bitwarden_id="88d319c2-832b-470f-b3f7-b3f00057b49c",
            description="Segredo de validação webhook do Logto",
        ),
        SecretMapping(
            env_var="LOGTO_M2M_APP_ID",
            bitwarden_id="c697d0d7-a2ff-40d5-9827-b3f00057bec3",
            description="App ID (Client ID) da aplicação M2M do Logto",
        ),
        SecretMapping(
            env_var="LOGTO_M2M_APP_SECRET",
            bitwarden_id="903e5460-c34e-4399-a5a6-b3f00057c895",
            description="App Secret (Client Secret) da aplicação M2M do Logto",
        ),
    ],
}

# Variáveis locais (não-secrets) que devem estar no .env
LOCAL_VARS: dict[str, str] = {
    "PORT": "3000",
    "ALLOWED_ORIGINS": "http://localhost:3000,http://localhost:3001",
    "SC_DB_HOST": "localhost",
    "SC_DB_PORT": "5433",
    "LOGTO_ENDPOINT": "http://localhost:3001",
    "LOGTO_ADMIN_ENDPOINT": "http://localhost:3002",
}


# ============================================================================


class Colors:
    """Cores ANSI para output"""

    RED = "\033[0;31m"
    GREEN = "\033[0;32m"
    YELLOW = "\033[1;33m"
    BLUE = "\033[0;34m"
    NC = "\033[0m"  # No Color


def log_info(msg: str) -> None:
    """Log informativo"""
    print(f"{Colors.GREEN}[INFO]{Colors.NC} {msg}", file=sys.stderr)


def log_warn(msg: str) -> None:
    """Log de warning"""
    print(f"{Colors.YELLOW}[WARN]{Colors.NC} {msg}", file=sys.stderr)


def log_error(msg: str) -> None:
    """Log de erro"""
    print(f"{Colors.RED}[ERROR]{Colors.NC} {msg}", file=sys.stderr)


def check_dependencies() -> None:
    """Valida que bws CLI está instalado"""
    try:
        subprocess.run(
            ["bws", "--version"],
            check=True,
            capture_output=True,
            text=True,
        )
    except FileNotFoundError:
        log_error("bws CLI não encontrado")
        log_error("Instale com: npm install -g @bitwarden/sdk-cli")
        sys.exit(1)
    except subprocess.CalledProcessError:
        log_error("bws CLI encontrado mas falhou ao executar")
        sys.exit(1)


def check_access_token() -> str:
    """Valida e retorna BW_ACCESS_TOKEN"""
    token = os.getenv("BW_ACCESS_TOKEN")
    if not token:
        log_error("BW_ACCESS_TOKEN não definido")
        log_error("Export antes: export BW_ACCESS_TOKEN='seu-token'")
        sys.exit(1)
    return token


def get_secret(secret_id: str, access_token: str) -> str | None:
    """
    Recupera secret do Bitwarden Secrets Manager

    Args:
        secret_id: UUID da secret no Bitwarden
        access_token: Token de acesso do Machine Account

    Returns:
        Valor da secret ou None se não encontrado/erro
    """
    try:
        result = subprocess.run(
            ["bws", "secret", "get", secret_id, "--access-token", access_token],
            check=True,
            capture_output=True,
            text=True,
        )

        data = json.loads(result.stdout)
        return data.get("value")

    except subprocess.CalledProcessError as e:
        log_warn(f"Falha ao recuperar secret {secret_id}: {e.stderr.strip()}")
        return None
    except json.JSONDecodeError:
        log_warn(f"Resposta inválida do bws para secret {secret_id}")
        return None
    except Exception as e:
        log_warn(f"Erro inesperado ao recuperar secret {secret_id}: {e}")
        return None


def validate_secrets_config(env: Environment) -> None:
    """Valida que não há IDs 'TBD' na configuração"""
    invalid_secrets = [
        s.env_var
        for s in SECRETS_MAP.get(env, [])
        if s.bitwarden_id == "TBD" and s.required
    ]

    if invalid_secrets:
        log_error(f"Secrets com ID 'TBD' no ambiente {env.value}:")
        for var in invalid_secrets:
            log_error(f"  - {var}")
        log_error("")
        log_error("Atualize os IDs em scripts/load_secrets_from_bitwarden.py")
        log_error("ou marque como required=False se opcional")
        sys.exit(1)


def generate_env_file(
    env: Environment,
    output_path: Path,
    access_token: str,
    dry_run: bool = False,
) -> int:
    """
    Gera arquivo .env com secrets do Bitwarden

    Args:
        env: Ambiente (dev/staging/prod)
        output_path: Caminho do arquivo .env de saída
        access_token: Token Bitwarden
        dry_run: Se True, apenas simula sem criar arquivo

    Returns:
        0 em sucesso, 1 em erro
    """
    log_info("=" * 60)
    log_info("Bitwarden Secrets Loader")
    log_info("=" * 60)
    log_info(f"Ambiente: {env.value}")
    log_info(f"Output: {output_path}")
    log_info(f"Dry-run: {dry_run}")
    log_info("")

    # Validar configuração
    validate_secrets_config(env)

    secrets_map = SECRETS_MAP.get(env, [])
    if not secrets_map:
        log_error(f"Nenhuma secret configurada para ambiente '{env.value}'")
        return 1

    # Recuperar secrets
    log_info(f"Recuperando {len(secrets_map)} secrets do Bitwarden...")
    secrets_values: dict[str, str] = {}
    errors = 0

    for secret in secrets_map:
        log_info(f"  → {secret.env_var}: {secret.description}")

        value = get_secret(secret.bitwarden_id, access_token)

        if value is None:
            if secret.required:
                log_error(f"    ✗ Secret obrigatória não encontrada: {secret.env_var}")
                errors += 1
            else:
                log_warn(f"    ⚠ Secret opcional não encontrada: {secret.env_var}")
        else:
            secrets_values[secret.env_var] = value
            # Não logue o valor real (segurança)
            log_info(f"    ✓ Recuperado ({len(value)} chars)")

    if errors > 0:
        log_error("")
        log_error(f"{errors} secret(s) obrigatória(s) faltando")
        return 1

    # Gerar conteúdo do arquivo
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    lines = [
        "# " + "=" * 68,
        "# CONECTA SOCIAL - Environment Variables",
        f"# Gerado automaticamente em: {timestamp}",
        f"# Ambiente: {env.value}",
        f"# Fonte: Bitwarden Secrets Manager",
        "# " + "=" * 68,
        "# ⚠️  SEGURANÇA: NÃO commite este arquivo!",
        "# " + "=" * 68,
        "",
        "# --- Configurações Locais (Não-Secrets) ---",
    ]

    for var, value in LOCAL_VARS.items():
        lines.append(f"{var}={value}")

    lines.extend(
        [
            "",
            "# --- Secrets (Bitwarden Secrets Manager) ---",
            "",
            "# Database Social Care",
        ]
    )

    # Agrupar secrets por categoria
    db_vars = ["SC_DB_USER", "SC_DB_PASSWORD", "SC_DB_NAME"]
    logto_db_vars = ["LOGTO_DB_USER", "LOGTO_DB_PASSWORD", "LOGTO_DB_NAME"]
    logto_vars = [
        "LOGTO_SECRET_VAULT_KEK",
        "LOGTO_WEBHOOK_SECRET",
        "LOGTO_M2M_APP_ID",
        "LOGTO_M2M_APP_SECRET",
    ]

    for var in db_vars:
        if var in secrets_values:
            lines.append(f"{var}={secrets_values[var]}")

    lines.append("")
    lines.append("# Database Logto")
    for var in logto_db_vars:
        if var in secrets_values:
            lines.append(f"{var}={secrets_values[var]}")

    lines.append("")
    lines.append("# Logto Auth/IAM")
    for var in logto_vars:
        if var in secrets_values:
            lines.append(f"{var}={secrets_values[var]}")

    # Adicionar outras secrets não categorizadas
    categorized = set(db_vars + logto_db_vars + logto_vars)
    other_secrets = {k: v for k, v in secrets_values.items() if k not in categorized}

    if other_secrets:
        lines.append("")
        lines.append("# Outras")
        for var, value in other_secrets.items():
            lines.append(f"{var}={value}")

    # Adicionar footer
    lines.extend(
        [
            "",
            "# " + "=" * 68,
            "# 🔐 GUIA DE SEGURANÇA",
            "# " + "=" * 68,
            "# 1. Este arquivo contém secrets sensíveis do Bitwarden",
            "# 2. NUNCA commite em repositórios Git",
            "# 3. Adicione ao .gitignore (já configurado)",
            "# 4. Regenere com: python3 scripts/load_secrets_from_bitwarden.py",
            "# " + "=" * 68,
            "",
        ]
    )

    content = "\n".join(lines)

    # Escrever arquivo ou dry-run
    if dry_run:
        log_info("")
        log_info("[DRY-RUN] Conteúdo que seria gerado:")
        log_info("-" * 60)
        print(content)
        log_info("-" * 60)
    else:
        try:
            output_path.write_text(content, encoding="utf-8")
            log_info("")
            log_info(f"✅ Arquivo gerado: {output_path}")
            log_info(f"   Variáveis locais: {len(LOCAL_VARS)}")
            log_info(f"   Secrets recuperadas: {len(secrets_values)}")
        except Exception as e:
            log_error(f"Erro ao escrever arquivo: {e}")
            return 1

    log_info("")
    log_info("⚠️  Certifique-se de que .env está no .gitignore")
    return 0


@dataclass
class CliArgs:
    """Argumentos CLI"""

    env: Environment
    output: Path
    dry_run: bool


def parse_args(argv: Sequence[str]) -> CliArgs:
    """Parse argumentos CLI"""
    parser = argparse.ArgumentParser(
        description="Carrega secrets do Bitwarden e gera arquivo .env",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  # Desenvolvimento
  export BW_ACCESS_TOKEN="seu-token"
  python3 scripts/load_secrets_from_bitwarden.py --env dev

  # Produção
  python3 scripts/load_secrets_from_bitwarden.py --env prod --output .env.prod

  # Dry-run (apenas simular)
  python3 scripts/load_secrets_from_bitwarden.py --env dev --dry-run
        """,
    )

    parser.add_argument(
        "--env",
        type=str,
        choices=[e.value for e in Environment],
        default="dev",
        help="Ambiente (dev/staging/prod). Default: dev",
    )

    parser.add_argument(
        "--output",
        type=Path,
        default=Path(".env"),
        help="Caminho do arquivo .env de saída. Default: .env",
    )

    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simula geração sem criar arquivo",
    )

    args = parser.parse_args(argv)

    return CliArgs(
        env=Environment(args.env),
        output=args.output,
        dry_run=args.dry_run,
    )


def main(argv: Sequence[str]) -> int:
    """Entrypoint principal"""
    args = parse_args(argv)

    # Validações
    check_dependencies()
    access_token = check_access_token()

    # Gerar .env
    return generate_env_file(
        env=args.env,
        output_path=args.output,
        access_token=access_token,
        dry_run=args.dry_run,
    )


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
