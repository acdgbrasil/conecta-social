# Shared Cookbook

> Receitas práticas para aplicar os utilitários de `@conecta/shared` em fluxos reais de domínio.

Cada receita segue o formato:
- **Cenário** — problema recorrente observado nos bounded contexts.
- **Ferramentas** — módulos do shared necessários.
- **Passo a passo** — código comentado inspirado nos padrões definidos no handbook.

## Receitas disponíveis
- [Construindo catálogos de erros consistentes](./domain-errors.md)
- [Higienizando entradas opcionais](./option-sanitizer.md)
- [Garantindo invariantes em coleções](./immutable-collections.md)
- [Orquestrando value objects com Result](./result-workflow.md)
- [Gerando identificadores estáveis](./uuid-identifiers.md)

<Note>
  Antes de copiar o código, ajuste nomes de módulos e prefixos de erro para o seu bounded context. Os exemplos usam `social-care` apenas como referência.
</Note>
