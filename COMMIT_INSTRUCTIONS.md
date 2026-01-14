# Instruções para Commit Final da Branch `feat/protocols-perf-versioning`

Este guia consolida todas as alterações realizadas para estabilizar o projeto, corrigir auditorias, alinhar a arquitetura TypeScript/Swift e preparar a documentação.

## 1. Resumo das Alterações

### 🛡️ Segurança e Estabilidade (Audit Fixes)
- **Correção de Perda de Dados**: Adicionado `await` crítico no `RegisterNewPatientUseCase` ao publicar eventos.
- **SQLite Repository**: Refatorado para suportar injeção de dependência e inicialização correta de tabelas em memória, consertando testes de integração.
- **Ambiente**: Removido `bun.lock` do `.gitignore` (segurança de supply chain) e corrigido erro de sintaxe no `launch.json`.

### 🧹 Qualidade de Código (Lint & Format)
- **Correção em Massa**: Executado `biome check --write` em todo o projeto TS (130+ arquivos).
- **Otimização**: Conversão de imports de valores para `import type` onde aplicável.
- **Configuração**: Criação de `.biomeignore` para excluir artefatos gerados pelo Protobuf.

### 🏗️ Infraestrutura e Contratos
- **Protobuf**: Configuração do `buf.gen.yaml` e geração de código para TS (`shared`) e Swift (`acdg`).
- **Compatibilidade Cross-Language**: Implementação de `DomainErrorFactory.swift` e `DomainError.swift` no pacote ACDG para espelhar a estrutura de erros do TypeScript (IDs rastreáveis, Timezone Fortaleza).

### 📚 Documentação e Governança
- **Organização**: Arquivos soltos (`PROJECT_AUDIT`, `MIGRATION_NOTES`) movidos para o histórico em `handbook/reports/`.
- **ACDG Handbook**: Migração completa da documentação técnica Swift para `handbook/codebase/acdg/`.
- **Integração**: Links cruzados adicionados ao Catálogo de Integrações.
- **Auditoria**: Gerado `project-status-audit-2026-01-14.md` atestando 100% de testes passando e zero dívida técnica explícita.
- **Roadmap**: Criado `application-completion-plan.md` detalhando os próximos passos para o Social Care.

---

## 2. Comandos para Execução

Execute os comandos abaixo na raiz do projeto:

```bash
# 1. Adicionar todos os arquivos modificados e novos (incluindo código gerado e docs)
git add .

# 2. Verificar o que será commitado (opcional, mas recomendado)
git status

# 3. Realizar o commit
git commit -m "chore(all): consolidate project stability, audit fixes and cross-lang alignment

- fix(social-care): add missing await in event bus publish to prevent data loss
- fix(infra): refactor SQLite repository for proper in-memory table initialization
- chore(lint): apply biome fixes (import types, formatting) across all packages
- feat(infra): configure buf.gen.yaml and generate protobuf contracts for TS/Swift
- feat(acdg): port DomainErrorFactory to Swift for shared kernel compatibility
- docs(handbook): migrate ACDG technical docs and cross-link integration catalog
- docs(audit): add project status audit and completion plan for social-care
- config: fix launch.json syntax and .gitignore rules"
```

---

## 3. Próximos Passos (Pós-Merge)

Após o merge desta branch, o projeto estará pronto para:
1.  Executar o plano `handbook/codebase/conecta-raros/social-care/application-completion-plan.md`.
2.  Iniciar a implementação dos consumidores de eventos no ACDG (Swift).
