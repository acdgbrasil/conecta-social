# Ambientes de Deploy

## Matriz de Ambientes

| Ambiente | Objetivo | Trigger principal | Controle de acesso | Dados/Segredos | Status |
| :--- | :--- | :--- | :--- | :--- |
| `dev` | Integração contínua e validação rápida | `pull_request`, `push` em branches de trabalho | Regras mínimas + checks obrigatórios | Secrets de baixo privilégio | `ATIVO` |
| `qa` | Validação funcional integrada | promoção manual a partir de `dev` | Aprovação de time técnico | Banco e credenciais isoladas de QA | `PLANEJADO` |
| `pentest` | Testes ofensivos e validação de hardening | promoção manual a partir de `qa` | Acesso restrito + auditoria | Secrets dedicados, TTL curto quando possível | `PLANEJADO` |
| `release` | Candidato a produção com versão fixa | tag/release candidate (`vX.Y.Z-rc.N`) | Aprovação de release manager | Certificados TLS e webhook de anúncio | `PLANEJADO` |
| `prod` | Operação oficial | promoção aprovada de `release` | Proteções máximas + trilha de auditoria | Secrets de produção com menor escopo possível | `PLANEJADO` |

## Fase atual (operação solo)
- Time atual: 1 pessoa.
- Ambiente habilitado para execução contínua: `dev`.
- Ambientes `qa`, `pentest`, `release` e `prod` ficam documentados como roadmap até ampliar capacidade operacional.

## Regras de Promoção
1. `dev -> qa`: exige testes unitários/integrados verdes e checklist técnico.
2. `qa -> pentest`: exige evidência de estabilidade funcional.
3. `pentest -> release`: exige ausência de vulnerabilidade crítica/alta pendente.
4. `release -> prod`: exige aprovação formal, versão publicada e notas de release.

## Proteções Recomendadas por Ambiente
- `dev`
  - checks obrigatórios de PR;
  - revisão automática (linters, testes, análise estática).
- `qa`
  - environment protection no GitHub (reviewers obrigatórios).
- `pentest`
  - acesso restrito por equipe;
  - execução de scanners e suites de segurança.
- `release`
  - artefatos imutáveis;
  - validação TLS e assinatura/versionamento de build.
- `prod`
  - rollout controlado (idealmente canário ou blue/green quando aplicável);
  - plano explícito de rollback.

## Observabilidade mínima
- Logs centralizados por ambiente.
- Alertas de deploy com status (sucesso/falha).
- Métricas de lead time, falha de mudança e tempo de recuperação.
