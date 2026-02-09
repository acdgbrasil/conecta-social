# 02 — Handbook & Knowledge Base

O `handbook/` é o núcleo de alinhamento. Ele contém tanto direcionadores estratégicos quanto documentação operacional.

## Estrutura Principal
```
handbook/
├─ principles/            → fundamentos táticos (ex.: testing-and-domain.md)
├─ domain_questions/      → entrevistas/artefatos DDD (ex.: queue_domain.md)
├─ codebase/              → decisões específicas por pacote
├─ process/               → cadências, cerimônias e checklists humanos
├─ quality/               → critérios de pronto, métricas, gitleaks
├─ tooling/               → guias de Bun, package manager, etc.
├─ references/            → materiais externos e glossários
└─ reports/               → registros (code reviews, daily, perf, refactor)
```

### Como operar
1. **Descoberta de Domínio** → `handbook/domain_questions` guarda canvas e entrevistas. Ex.: `queue_domain.md` lista agregados, eventos, políticas.
2. **Princípios Executáveis** → `handbook/principles/testing-and-domain.md` conecta a filosofia RED/Green aos pacotes.
3. **Decisões do Código** → `handbook/codebase/<contexto>.md` descreve invariantes locais e atalhos.
4. **Processo Vivo** → `handbook/process` define como abrir features, syncs, checklist de deploy.
5. **Qualidade & Ferramentas** → `handbook/quality` e `handbook/tooling` registram guardrails técnicos.
6. **Reports** → cada incidente/review gera um arquivo em `handbook/reports/<tipo>/` para rastreabilidade.

### Regras de Uso
- Toda alteração relevante de domínio precisa de um PR no handbook antes (ou junto) do código.
- Documentos devem possuir data, versão e autoria (ver `queue_domain.md`).
- Utilize emojis/títulos consistentes para facilitar navegação (padrão atual usa ícones para seções principais).
- Ao clonar o modelo, gere um template vazio para cada pasta e adicione README explicando o objetivo.

> Copiar este handbook para outro monorepo garante que decisões fiquem próximas do código sem depender de wikis externas.
