# Code Reviews

Diretório dedicado aos relatórios de revisão de código realizados em pull requests.
O objetivo é manter um histórico consultável dos achados críticos, recomendações e follow-ups.

## Convenções
- Nome do arquivo: `code-review-<identificador-do-pr>-<aaaa-mm-dd>.md`.
- Cada documento deve registrar, no mínimo, visão geral, itens encontrados (com gravidade) e próximos passos.
- Utilize referências precisas a arquivos/linhas (`caminho:linha`) para facilitar a triagem futura.
- Sempre que possível, inclua trechos de código ou pseudo-código sugerindo correção.
- Relacione decisões ao processo de versionamento e às regras de domínio quando aplicável.

## Índice sugerido
1. **Visão geral** — contexto do PR e escopo da revisão.
2. **Principais achados** — tabela ou lista resumida com gravidade e status.
3. **Detalhes dos achados** — um subtítulo por item, com descrição, impacto e recomendação.
4. **Follow-ups** — ações pendentes, responsáveis ou links para tarefas complementares.

Mantenha o tom analítico e priorize a prevenção de regressões, alinhado às regras documentadas em `handbook/process/` e `handbook/principles/`.
