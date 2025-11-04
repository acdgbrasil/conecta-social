# Conecta Social — Handbook

Este diretório concentra toda a documentação viva do projeto. A ideia é manter a raiz do repositório o mais enxuta possível enquanto preservamos um ponto único de verdade para contexto, decisões e guias de trabalho.

## Como o handbook está organizado
- `reports/` — registros cronológicos (diários e relatórios de refatoração). Funcionam como log histórico.
- `quality/` — estado da suíte de testes, planos de correção e métricas de qualidade.
- `process/` — regras operacionais, incluindo versionamento, retrocompatibilidade e rituais de PR.
- `principles/` — fundamentos técnicos e culturais (DDD + EDD, TDD/BDD e como manter testes como documentação viva).
- `tooling/` — notas de ferramentas, com foco especial em Bun e no ecossistema atual.
- `references/` — material de apoio (livros, artigos, PDFs). Mantido aqui para consulta offline.

## Convenções gerais
- Alterações estruturais no código ou domínio devem ser refletidas neste handbook (reports, principles ou process).
- Sempre que uma decisão afetar retrocompatibilidade, registrar no arquivo `process/versioning.md`.
- Antes de abrir PR, revisar a seção `quality/` para garantir que o estado esperado dos testes esteja alinhado com a realidade.
- Testes fazem parte da documentação: manter descrições claras (`describe/it`) e, quando necessário, registrar resumos no handbook para orientar futuros colaboradores.

Para qualquer novo documento, escolha a sub-pasta existente que fizer sentido ou crie uma nova mantendo a hierarquia descrita acima. O objetivo é nunca mais se perguntar “onde registrar isso?”.
