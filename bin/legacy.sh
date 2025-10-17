#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVICE_DIR="${ROOT_DIR}/packages/legacy"

if ! command -v bun >/dev/null 2>&1; then
  echo "error: bun não está instalado no PATH" >&2
  exit 1
fi

cd "${SERVICE_DIR}"

if [[ -f "bun.lockb" || -f "bun.lock" ]]; then
  bun install --frozen-lockfile
else
  bun install
fi

bun run start "$@"
