# Shared Cookbook

> Receitas práticas para aplicar os utilitários expostos em `src/shared` e nos value objects de `@conecta/social-care`.

Cada receita segue o formato:
- **Cenário** — problema recorrente observado nos bounded contexts.
- **Ferramentas** — módulos do shared necessários.
- **Passo a passo** — código comentado espelhando o que já está em `src/modules/social-care/domain`.

## Como usar
- Todos os imports apresentados existem hoje no repositório via `tsconfig.json` (ex.: `@conecta/domain-error`, `@conecta/result`, `@conecta/uuid`).
- Copie apenas o esqueleto e ajuste `bc`, `module`, prefixos e tags para o bounded context desejado.
- Sempre valide com a suíte de testes do pacote correspondente (`src/shared/tests/**`) antes de propagar para outros contextos.

## Receitas disponíveis
- [Construindo catálogos de erros consistentes](./domain-errors.md) — `makeDomainErrorFactory`, `shortcuts` e `toHttp` exatamente como usados em `src/modules/social-care/domain/errors`.
- [Higienizando entradas opcionais](./option-sanitizer.md) — conversão segura de payloads externos com `Option`, `guardLet` e value objects reais.
- [Garantindo invariantes em coleções](./immutable-collections.md) — uso de `ImutableListFactory` e `hasDuplicates` presente no agregado `Patient`.
- [Orquestrando value objects com Result](./result-workflow.md) — pipelines com `ICDCode`, `Timestamp` e `Diagnosis` utilizando `flatMap`.
- [Gerando identificadores estáveis](./uuid-identifiers.md) — implementação de IDs com `Uuid.create`, validação v7 e erros de catálogo.

<Note>
  Os exemplos usam o módulo `social-care` para manter o cookbook sincronizado com o repositório atual. Ao migrar para outro bounded context, troque apenas os identificadores e mantenha as mesmas APIs.
</Note>
