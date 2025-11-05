# @conecta/shared/fn-pattern

> Utilitários funcionais leves compartilhados entre os módulos.

## Módulos exportados
- `pipe`
- `ImutableListFactory`
- `ImutableList` (tipo apenas)

### `pipe(value, ...fns)`
Composição síncrona de funções estilo Unix pipeline. Cada transform recebe o output do anterior.

```ts typescript
import { pipe } from "@conecta/fn";

const normalized = pipe(
  rawInput,
  (value) => value.trim(),
  (value) => value.replace(/\s+/g, " "),
  (value) => value.toUpperCase(),
);
```

<Note>
  `pipe` não trata efeitos colaterais. Se precisar de short-circuit por erro, use `Result` ou `Option`.
</Note>

### `ImutableListFactory`
Cria coleções imutáveis com operações básicas (`add`, `remove`, `setUnique` etc.). Ideal para manter invariantes em Value Objects.

```ts typescript
import { ImutableListFactory } from "@conecta/fn";

const list = ImutableListFactory.fromArray(["A", "B", "B"]);

const unique = list.setUnique();
unique.getAll(); // ["A", "B"]

const withC = unique.add("C");
withC.getAll(); // ["A", "B", "C"]
```

APIs disponíveis:
- `empty<T>()`
- `fromArray<T>(elements: T[])`
- `castTolist(list)`

Cada instância retornada expõe:
- `add`, `remove`, `getAll`, `isEmpty`, `count`, `contains`, `empty`, `castTolist`, `setUnique`

<Accordion title="Quando usar ImutableList">
  Preserve invariantes em objetos de domínio sem expor arrays mutáveis. Sempre que uma entidade/value object aceitar múltiplos valores e precisar de operações derivadas (uniq, count), utilize a lista imutável.
</Accordion>
