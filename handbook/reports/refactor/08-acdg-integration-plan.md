# 📑 Plano de Integração de Documentação: Sistema ACDG

## 1. Diagnóstico Atual

Atualmente, você tem três fontes de verdade desconectadas sobre o sistema de Filas da ACDG:

1.  **`handbook/domain_questions/queue_manager/`**: Documentação de *Domínio* (conceitual, regras de negócio, Bounded Contexts). Está no lugar certo.
2.  **`handbook/Docs/Architeture/`**: Documentação *Técnica* (arquitetura POP, Swift, regras de implementação, "A Lei"). Está em uma pasta "solta" (`Docs`) que foge do padrão do handbook.
3.  **`packages/acdg/queue-orq/`**: A implementação real (código Swift).

**O Problema**: Um desenvolvedor novo não saberia se deve olhar em `Docs/`, `domain_questions/` ou `codebase/` para entender como codar no módulo de filas.

## 2. Estrutura Alvo Proposta

Vamos mover a documentação técnica para `handbook/codebase/acdg/`, espelhando a estrutura física do monorepo (`packages/acdg/`).

A nova estrutura sugerida para o Handbook:

```text
handbook/
├── codebase/
│   ├── conecta-raros/       <-- (Já existente: social-care)
│   ├── shared/              <-- (Já existente: utilitários)
│   └── acdg/                <-- (NOVO: Sistema ACDG)
│       ├── README.md        <-- Índice dos pacotes ACDG
│       └── queue-orquestration/
│           ├── documentation.md       <-- Visão geral (Quick start)
│           └── architecture-guide/    <-- Os arquivos vindos de 'Docs/Architeture'
│               ├── 00_Architecture_Guidelines.md
│               ├── 01_Package_Structure.md
│               ├── ...
│               └── 07_Performance.md
```

## 3. Passo a Passo da Migração

### Passo 1: Criar a Home do ACDG no Codebase
Crie a estrutura de pastas e um `README.md` índice.

*   **Ação**: Criar pasta `handbook/codebase/acdg/queue-orquestration/`.
*   **Ação**: Criar `handbook/codebase/acdg/README.md` listando os contextos do ACDG.

### Passo 2: Migrar a "Bíblia Técnica" (Docs)
A pasta `handbook/Docs/Architeture` contém guias de altíssima qualidade ("A Lei", POP, Performance). Eles não devem ser perdidos ou resumidos excessivamente.

*   **Ação**: Mover todo o conteúdo de `handbook/Docs/Architeture/` para `handbook/codebase/acdg/queue-orquestration/architecture-guide/`.
*   **Benefício**: Isso coloca as regras de implementação (Swift/POP) logo ao lado da documentação do pacote, deixando claro que aquelas regras se aplicam especificamente a *este* microsserviço.

### Passo 3: Criar o `documentation.md` Unificador
Assim como no `social-care`, precisamos de um ponto de entrada rápido. Crie um arquivo `handbook/codebase/acdg/queue-orquestration/documentation.md` que sirva de resumo e índice.

**Esboço sugerido para `documentation.md`:**

```markdown
# @packages/acdg/queue-orq

> Core domain de Orquestração de Filas da unidade ACDG. Implementado em Swift (v6.0) seguindo arquitetura Protocol-Oriented.

## Visão Geral
Este pacote gerencia a `VisitaDoDia`, `ServiceOrder` e as filas de especialidade. É um sistema de alta performance otimizado para hardware restrito (Raspberry Pi).

## Arquitetura (A Lei)
Este projeto segue regras estritas de arquitetura. **Leitura obrigatória antes de contribuir:**

1. [Diretrizes de Arquitetura](./architecture-guide/00_Architecture_Guidelines.md) - A estrutura POP e Clean Architecture.
2. [Guia de Imutabilidade](./architecture-guide/03_Immutability_and_Value_Semantics.md) - Por que usamos `struct` e não `class`.
3. [Especificações de Domínio](./architecture-guide/04_Domain_Specifications.md) - Definição de `DailyVisit`, `ServiceOrder`, etc.

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
```

### Passo 4: Cruzar Referências com o Domínio
No arquivo de domínio (`handbook/domain_questions/queue_manager/README.md`), adicione um link explícito para a implementação técnica.

> "Para detalhes de implementação, arquitetura Swift e guias de performance, consulte [Codebase Guide: Queue Orchestration](../../codebase/acdg/queue-orquestration/documentation.md)."

### Passo 5: Limpeza
Após a migração, a pasta `handbook/Docs` deve ser **removida**, pois seu conteúdo foi integrado ao local correto.

---

## 4. Integração com o Conecta Raros (Integration Catalog)

Como o ACDG interage com o Conecta Raros (Social Care), certifique-se de que o **Catálogo de Integrações** (`handbook/integration-catalog.md`) esteja atualizado com essa relação:

| Sistema A | Sistema B | Tipo | Mecanismo |
| :--- | :--- | :--- | :--- |
| **ACDG (Triagem)** | **Conecta Raros (Social)** | Consumidor | ACL/SDK (consome `Patient` para criar plano) |
| **ACDG (Filas)** | **Conecta Raros (BI)** | Produtor | Eventos (`AtendimentoConcluido`) |
