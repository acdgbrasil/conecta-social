# Codebase Guide

> Documentação viva dos pacotes internos. O objetivo é facilitar a navegação pelo monorepo sem precisar abrir o código-fonte imediatamente.

## Organização
- Cada subpasta replica a estrutura de `packages/`.
- Dentro de cada módulo mantemos um `documentation.md` inspirado no estilo das páginas do Bun, com foco em introdução, contrato público e exemplos de uso.

<Note>
  Sempre que um módulo receber novas APIs ou regras de negócio, atualize o respectivo documento antes de abrir o PR.
</Note>

### Escopo atual
- `shared/` — utilitários reutilizáveis e padrões cross-context.
- `conecta-raros/` — bounded contexts sociais, começando por `social-care` e seus agregados/VOs.

Conforme novos contextos amadurecem, replique o formato (README + `documentation.md`) para manter a superfície pública sincronizada com o código.