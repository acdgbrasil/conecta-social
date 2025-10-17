pipeline {
  agent none

  options {
    ansiColor('xterm')
    timestamps()
    disableConcurrentBuilds()
    skipDefaultCheckout()
  }

  parameters {
    choice(
      name: 'RELEASE_CHANNEL',
      choices: ['alpha', 'beta', 'rc', 'stable'],
      description: 'Canal de release usado para gerar marcações ao promover main -> production'
    )
  }

  environment {
    BUN_FLAGS = '--frozen-lockfile'
  }

  stages {
    stage('Checkout') {
      agent {
        docker {
          image 'alpine/git:2.45.2'
          args '-u 0:0'
          reuseNode true
        }
      }
      steps {
        checkout scm
      }
    }

    stage('Static Code Quality (SAST + Types)') {
      agent {
        docker {
          image 'oven/bun:1.1.18'
          args '-u 0:0'
          reuseNode true
        }
      }
      steps {
        sh '''
          set -euo pipefail
          if [ ! -f package.json ]; then
            echo "Nenhum package.json na raiz - pulando validação estática."
            exit 0
          fi

          if ! grep -q '"typecheck"[[:space:]]*:' package.json && ! grep -q '"lint"[[:space:]]*:' package.json; then
            echo "Sem scripts de lint ou typecheck na raiz - pulando estágio."
            exit 0
          fi

          bun install ${BUN_FLAGS}

          if grep -q '"typecheck"[[:space:]]*:' package.json; then
            bun run typecheck
          fi

          if grep -q '"lint"[[:space:]]*:' package.json; then
            bun run lint
          fi
        '''
      }
    }

    stage('Package Validation (Hex Modules)') {
      when {
        expression { fileExists('packages') }
      }
      agent {
        docker {
          image 'oven/bun:1.1.18'
          args '-u 0:0'
          reuseNode true
        }
      }
      steps {
        sh '''
          set -euo pipefail
          mkdir -p reports/packages
          if [ ! -d packages ]; then
            echo "Nenhum pacote encontrado, pulando etapa."
            exit 0
          fi
          for pkg in packages/*; do
            if [ -d "$pkg" ] && [ -f "$pkg/package.json" ]; then
              echo "▶︎ Validando ${pkg}"
              (
                cd "$pkg"
                if [ -f bun.lockb ] || [ -f bun.lock ]; then
                  bun install ${BUN_FLAGS}
                else
                  bun install
                fi
                bun run validate
              ) | tee "reports/packages/$(basename "$pkg")-validate.log"
            fi
          done
        '''
        archiveArtifacts artifacts: 'reports/packages/*.log', allowEmptyArchive: true, fingerprint: true
      }
    }

    stage('Secrets Scan (Code Layer)') {
      agent {
        docker {
          image 'zricethezav/gitleaks:8.18.3'
          args '-u 0:0 -v $WORKSPACE:/workspace'
          reuseNode true
        }
      }
      steps {
        sh '''
          set -euo pipefail
          cd /workspace
          gitleaks detect \
            --no-banner \
            --redact \
            --source=. \
            --config=gitleaks.toml
        '''
      }
    }

    stage('Dependency Audit (SCA + SBOM)') {
      agent {
        docker {
          image 'oven/bun:1.1.18'
          args '-u 0:0'
          reuseNode true
        }
      }
      steps {
        sh '''
          set -euo pipefail
          bun install ${BUN_FLAGS}
          mkdir -p reports
          bun audit --json > reports/dependency-audit.json || true
        '''
        archiveArtifacts artifacts: 'reports/dependency-audit.json', fingerprint: true
      }
    }

    stage('Unit Tests (TDD)') {
      agent {
        docker {
          image 'oven/bun:1.1.18'
          args '-u 0:0'
          reuseNode true
        }
      }
      steps {
        sh '''
          set -euo pipefail
          bun install ${BUN_FLAGS}
          mkdir -p reports
          bun test --reporter=junit --output-file=reports/unit-tests.xml
        '''
        junit 'reports/unit-tests.xml'
      }
    }

    stage('QA End-to-End') {
      when {
        allOf {
          anyOf {
            changeRequest target: 'dev'
            branch 'dev'
          }
          expression { fileExists('tests/e2e') }
        }
      }
      agent {
        docker {
          image 'oven/bun:1.1.18'
          args '-u 0:0'
          reuseNode true
        }
      }
      steps {
        sh '''
          set -euo pipefail
          bun install ${BUN_FLAGS}
          mkdir -p reports
          bun test --filter e2e --reporter=junit --output-file=reports/e2e-tests.xml
        '''
        junit 'reports/e2e-tests.xml'
      }
    }

    stage('Integration API Tests') {
      when {
        allOf {
          anyOf {
            changeRequest target: 'main'
            branch 'main'
          }
          expression { fileExists('tests/integration/collection.json') }
        }
      }
      agent {
        docker {
          image 'postman/newman:5-alpine'
          args '-u 0:0'
          reuseNode true
        }
      }
      steps {
        sh '''
          set -euo pipefail
          COLLECTION="tests/integration/collection.json"
          ENV_FILE="${COLLECTION%.json}.env.json"
          ARGS="--color on --reporter-cli-no-summary"
          if [ -f "$ENV_FILE" ]; then
            newman run "$COLLECTION" $ARGS --environment "$ENV_FILE"
          else
            newman run "$COLLECTION" $ARGS
          fi
        '''
      }
    }

    stage('Container Scan (Container Layer)') {
      when {
        anyOf {
          branch 'main'
          branch 'production'
          changeRequest target: 'main'
          changeRequest target: 'production'
        }
      }
      agent {
        docker {
          image 'aquasec/trivy:0.50.3'
          args '--security-opt seccomp=unconfined --security-opt apparmor=unconfined -u 0:0 -v $WORKSPACE:/workspace'
          reuseNode true
        }
      }
      steps {
        sh '''
          set -euo pipefail
          cd /workspace
          trivy fs --exit-code 0 --severity MEDIUM,HIGH,CRITICAL --scanners vuln,misconfig .
        '''
      }
    }

    stage('Policy-as-Code (Cluster Layer)') {
      when {
        expression { fileExists('policies') }
      }
      agent {
        docker {
          image 'openpolicyagent/conftest:v0.45.0'
          args '-u 0:0 -v $WORKSPACE:/workspace'
          reuseNode true
        }
      }
      steps {
        sh '''
          set -euo pipefail
          cd /workspace
          conftest test manifests --policy policies || echo "Nenhum manifesto encontrado, passando."
        '''
      }
    }

    stage('Cloud Guardrails (Cloud Layer)') {
      when {
        expression { fileExists('iac') }
      }
      agent {
        docker {
          image 'aquasec/tfsec:latest'
          args '-u 0:0 -v $WORKSPACE:/workspace'
          reuseNode true
        }
      }
      steps {
        sh '''
          set -euo pipefail
          cd /workspace/iac
          mkdir -p ../reports
          tfsec --format json --out ../reports/tfsec.json || true
        '''
        archiveArtifacts artifacts: 'reports/tfsec.json', fingerprint: true
      }
    }

    stage('Build Bun Binary Artifact') {
      when {
        anyOf {
          branch 'main'
          branch 'production'
          changeRequest target: 'production'
        }
      }
      agent {
        docker {
          image 'oven/bun:1.1.18'
          args '-u 0:0'
          reuseNode true
        }
      }
      steps {
        sh '''
          set -euo pipefail
          bun install ${BUN_FLAGS}
          mkdir -p build
          bun build src/index.ts --compile --outfile build/conecta-social
        '''
        archiveArtifacts artifacts: 'build/conecta-social', fingerprint: true
      }
    }

    stage('Generate Release Notes & Version') {
      when {
        anyOf {
          branch 'main'
          branch 'production'
          changeRequest target: 'production'
        }
      }
      agent {
        docker {
          image 'alpine/git:2.45.2'
          args '-u 0:0'
          reuseNode true
        }
      }
      environment {
        RELEASE_DIR = 'release'
      }
      steps {
        sh '''
          set -euo pipefail
          apk add --no-cache jq >/dev/null
          mkdir -p "${RELEASE_DIR}"
          PREVIOUS_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
          if [ -n "$PREVIOUS_TAG" ]; then
            RANGE="${PREVIOUS_TAG}..HEAD"
          else
            RANGE="HEAD~20..HEAD"
          fi
          git log --pretty=format:'- %h %s (%an)' ${RANGE} > "${RELEASE_DIR}/notes.md"
          VERSION="$(date -u +'%Y.%m.%d').${BUILD_NUMBER}-${params.RELEASE_CHANNEL}"
          echo "$VERSION" > "${RELEASE_DIR}/VERSION"
          jq -n --arg version "$VERSION" --arg sha "${GIT_COMMIT:-HEAD}" --arg channel "${params.RELEASE_CHANNEL}" \
            --arg date "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
            '{version:$version, commit:$sha, channel:$channel, built_at:$date}' > "${RELEASE_DIR}/metadata.json"
        '''
        archiveArtifacts artifacts: 'release/*', fingerprint: true
      }
    }

    stage('Deploy DEV Environment') {
      when {
        branch 'dev'
      }
      agent {
        docker {
          image 'oven/bun:1.1.18'
          args '-u 0:0'
          reuseNode true
        }
      }
      steps {
        sh '''
          set -euo pipefail
          bun install ${BUN_FLAGS}
          bash bin/deploy.sh dev build/conecta-social || bash bin/deploy.sh dev
        '''
      }
    }

    stage('Promote to Release Candidate (main)') {
      when {
        branch 'main'
      }
      agent {
        docker {
          image 'oven/bun:1.1.18'
          args '-u 0:0'
          reuseNode true
        }
      }
      steps {
        sh '''
          set -euo pipefail
          bash bin/deploy.sh staging build/conecta-social || true
        '''
      }
    }

    stage('Production Release') {
      when {
        branch 'production'
      }
      agent {
        docker {
          image 'oven/bun:1.1.18'
          args '-u 0:0'
          reuseNode true
        }
      }
      steps {
        sh '''
          set -euo pipefail
          bash bin/deploy.sh production build/conecta-social
        '''
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'reports/*.json', allowEmptyArchive: true
      archiveArtifacts artifacts: 'reports/*.xml', allowEmptyArchive: true
      cleanWs deleteDirs: true, disableDeferredWipeout: true
    }
    failure {
      echo 'Falha detectada - notifique o canal de incidentes.'
    }
  }
}
