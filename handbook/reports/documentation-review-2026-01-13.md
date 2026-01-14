# Relatório de Revisão de Documentação — 13/01/2026

## Visão Geral
Este relatório compila inconsistências, links quebrados e divergências arquiteturais encontradas entre a documentação viva (`handbook/**`) e a estrutura atual do código (`packages/**`).

## 🚨 Inconsistências Críticas

### 1. Estrutura de Diretórios e Pacotes
A documentação aponta para caminhos que foram renomeados ou reestruturados.

| Documento | Referência Incorreta | Realidade Atual | Ação Recomendada |
| :--- | :--- | :--- | :--- |
| `handbook/codebase/social/README.md` | `packages/social/social-care` | `packages/conecta-raros/social-care` | Atualizar paths e referências de import (`@conecta/social-care` vs `@conecta/conecta-raros`?) |
| `handbook/codebase/social/social-care/documentation.md` | Estrutura flat (`entities/`, `value-objects/`) | Arquitetura Hexagonal (`domain/`, `application/`, `infrastructure/`) | Reescrever guia para refletir a separação de camadas implementada em 08/01/2026. |
| `handbook/quality/quality-plan.md` | `packages/social/social-care/value-objects/*.ts` | `packages/conecta-raros/social-care/domain/value-objects/*.ts` | Atualizar planos de teste para apontar para os novos caminhos. |

### 2. Typos em Nomes de Pasta
| Local | Typo | Correção | Impacto |
| :--- | :--- | :--- | :--- |
| `handbook/domain_questions/` | `peaple-context` | `people-context` | Dificulta busca e links automáticos; demonstra falta de cuidado no "Core Domain" de identidade. |

### 3. Retrocompatibilidade e Legado
| Documento | Trecho | Realidade |
| :--- | :--- | :--- |
| `handbook/process/retrocompatibilidade.md` | "Legacy `src/domain` (somente leitura)" | `packages/legacy` foi removido (Relatório 06). |
| `handbook/reports/refactor/06-legacy-drop...` | "Remoção total de `packages/legacy`" | Confirmado. `src/` contém apenas `index.ts`. |

**Ação:** Atualizar a matriz de retrocompatibilidade para indicar que o legado foi extinto e não é mais uma alternativa de leitura.

### 4. Integrações Fragmentadas
As definições de integração estão espalhadas por múltiplos arquivos de "Domain Questions" (`queue_manager`, `peaple-context`, `social_care`), dificultando uma visão holística da arquitetura de sistemas.

**Ação:** Centralizar o catálogo de integrações (ver `handbook/integration-catalog.md` criado neste review).

## 📝 Lista de Tarefas para Correção

- [ ] **Renomear pasta**: `handbook/domain_questions/peaple-context` -> `people-context`.
- [ ] **Atualizar Handbook Social Care**: Reescrever `handbook/codebase/social/social-care/documentation.md` para documentar a estrutura `domain/` vs `application/`.
- [ ] **Fixar Paths**: Fazer um find/replace global em `handbook/` trocando `packages/social/social-care` por `packages/conecta-raros/social-care` (confirmar se o package.json name também mudou).
- [ ] **Limpar Retrocompatibilidade**: Remover menções a `src/domain` legado como algo ativo.
- [ ] **Linkar Integrações**: Adicionar link para o novo `handbook/integration-catalog.md` nos `README`s de cada contexto.

---
*Gerado via Gemini CLI Code Review*
