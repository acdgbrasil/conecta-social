# Relatório Diário — 08/01/2026

## Visão geral
- Consolidação arquitetural e limpeza técnica (Hygiene).
- A base de código agora segue rigorosamente a Arquitetura Hexagonal, com separação explícita entre Domínio e Aplicação.
- O sistema de tipos e configurações de ambiente (Bun/TS) foram unificados para eliminar a necessidade de `node_modules`.

## Atividades Realizadas

### 1. Refatoração Arquitetural (`social-care`)
- **Separação de Camadas:**
  - Todo o núcleo de negócio foi movido para `packages/social/social-care/domain/` (entities, value-objects, errors, events).
  - A camada de aplicação reside em `packages/social/social-care/application/` (use-cases, repositories, dtos, errors).
- **Organização de Testes:**
  - Testes unitários foram movidos para dentro de suas respectivas camadas (`domain/tests/unit` e `application/tests/unit`), facilitando a coesão.
- **Resultados:** `bun test packages/social/social-care` roda 174 testes com 100% de sucesso.

### 2. Higiene de Código e Importações
- **Aliases Obrigatórios:**
  - Varredura completa para substituir importações relativas longas (`../../`) e imports de `src` por aliases (`@conecta/social-care`, `@conecta/shared`, etc.).
  - Configuração do VSCode (`settings.json`) ajustada para priorizar "non-relative" imports e auto-imports de tipos.
- **Sincronia de Configuração:**
  - `tsconfig.json` e `bunfig.toml` agora espelham perfeitamente os mesmos paths e aliases, evitando divergências entre tempo de compilação e execução.

### 3. Tooling Bun-Native
- **Eliminação de `node_modules`:**
  - O projeto foi configurado para rodar sem a pasta `node_modules`.
  - As definições de tipo do Bun (`bun-types`) foram copiadas para `types/` localmente.
  - `tsconfig.json` ajustado para olhar apenas para `./types`, garantindo um ambiente hermético e rápido.
  - `@types/bun-test.d.ts` expandido com matchers customizados (`toBeGreaterThan`, etc.) e tipos para `Bun.SQL`, `Cookie` e `FileSink`.

## Testes e Qualidade
- **Status:** Todos os testes (`domain` e `application`) estão **VERDES**.
- **Regressão:** Os testes de regressão de eventos e versionamento continuam passando após a reestruturação de pastas.

## Próximos Passos
1. Implementar `AddFamilyMemberUseCase` seguindo o novo padrão de pastas.
2. Criar testes automatizados de performance na raiz (`tests/perf`) conforme planejado.
3. Avaliar a criação de um script de *scaffold* para gerar novos Use Cases já na estrutura correta.
