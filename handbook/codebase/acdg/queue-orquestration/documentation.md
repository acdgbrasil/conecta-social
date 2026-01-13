# @packages/acdg/queue-orquestration

> Core domain de Orquestração de Filas da unidade ACDG. Implementado em Swift (v6.0) seguindo arquitetura Protocol-Oriented.

## Visão Geral
Este pacote gerencia a `VisitaDoDia`, `ServiceOrder` e as filas de especialidade. É um sistema de alta performance otimizado para hardware restrito (Raspberry Pi 3B+).

## Arquitetura (A Lei)
Este projeto segue regras estritas de arquitetura. **Leitura obrigatória antes de contribuir:**

1. [Diretrizes de Arquitetura](./architecture-guide/00_Architecture_Guidelines.md) - A estrutura POP e Clean Architecture.
2. [Estrutura do Monorepo](./architecture-guide/01_Package_Structure_Monorepo.md) - Configuração do Package.swift e módulos.
3. [Paradigma Orientado a Protocolos](./architecture-guide/02_Protocol_Oriented_Paradigm.md) - Como usar `structs` e `protocols`.
4. [Guia de Imutabilidade](./architecture-guide/03_Immutability_and_Value_Semantics.md) - Por que usamos `struct` e não `class`.
5. [Especificações de Domínio](./architecture-guide/04_Domain_Specifications.md) - Definição de `DailyVisit`, `ServiceOrder`, etc.
6. [Mapeamento de Conceitos](./architecture-guide/05_Domain_Concept_Mapping.md) - De/Para entre requisitos e código.
7. [Boas Práticas e Anti-Patterns](./architecture-guide/06_Best_Practices_and_AntiPatterns.md) - Guia para Code Reviews.
8. [Otimização de Performance](./architecture-guide/07_Performance_Hardware_Optimization.md) - Ajustes para Raspberry Pi.
9. [Guia de Testes Unitários](./architecture-guide/08_Unit_Testing_Guidelines.md) - Testando com POP.
10. [Testes de Integração BDD](./architecture-guide/09_Integration_Testing_BDD.md) - Cenários Gherkin.
11. [Plano de Testes (TDD)](./architecture-guide/10_Test_Plan_Guidelines.md) - Guia passo-a-passo para TDD.
12. [Estratégia de Escala](./architecture-guide/SCALING_STRATEGY.md) - Evolução para sistema distribuído.

## Estrutura do Pacote
- `Sources/Core`: Regras de negócio puras (Swift puro).
- `Sources/Application`: Casos de uso e orquestração.
- `Sources/InterfaceAdapters`: Implementação gRPC.
- `Sources/Shared`: Kernel compartilhado (TaggedIDs, Enums).

## Como rodar
```bash
# Build de desenvolvimento
swift build

# Rodar testes
swift test
```
