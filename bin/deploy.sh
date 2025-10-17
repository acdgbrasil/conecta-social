#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "usage: $0 <environment> [artifact_path]" >&2
  exit 1
fi

ENVIRONMENT="$1"
ARTIFACT="${2:-build/conecta-social}"
TARGET_DIR="deployments/${ENVIRONMENT}"

mkdir -p "${TARGET_DIR}"

if [[ -f "${ARTIFACT}" ]]; then
  cp -f "${ARTIFACT}" "${TARGET_DIR}/$(basename "${ARTIFACT}")"
else
  echo "warning: artifact ${ARTIFACT} não encontrado, registrando somente o meta dado" >&2
fi

cat <<EOF >> "${TARGET_DIR}/DEPLOY.log"
$(date -u +"%Y-%m-%dT%H:%M:%SZ") commit=${GIT_COMMIT:-unknown} build=${BUILD_NUMBER:-local} environment=${ENVIRONMENT}
EOF
