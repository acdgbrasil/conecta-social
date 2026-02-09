# Codebase Guide

> Documentação viva dos módulos internos. O objetivo é facilitar a navegação pelo monolito modular sem precisar abrir o código-fonte imediatamente.

## Organização
- A estrutura espelha `src/modules/` e `src/shared/`.
- Dentro de cada módulo mantemos um `documentation.md` inspirado no estilo das páginas do Bun, com foco em introdução, contrato público e exemplos de uso.

<Note>
  Sempre que um módulo receber novas APIs ou regras de negócio, atualize o respectivo documento antes de abrir o PR.
</Note>

### Escopo atual
- `shared/` — utilitários reutilizáveis, portas e adapters (`src/shared`).
- `social-care/` — Bounded Context de Prontuário Social (`src/modules/social-care`).
- `analysis-bi/` — (Planejado) Contexto de Análise e Pesquisa.
- `form-conversions/` — (Planejado) Contexto de Conversão e Download de Formulários.

Conforme novos contextos amadurecem, replique o formato (README + `documentation.md`) para manter a superfície pública sincronizada com o código.