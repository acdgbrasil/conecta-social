# @conecta/shared/fn-pattern

> Utilitários funcionais leves compartilhados entre os módulos.

## Módulos exportados
- `List` (Immutable List Namespace)
- `ImutableList<T>` (Tipo apenas)

### `List`
Namespace que fornece operações puras e de alta performance para coleções imutáveis baseadas em arrays nativos. Otimizado para o runtime Bun.

```ts typescript
import { List } from "@/shared/fn-pattern/imutable-list";

// Construção
const list = List.of("A", "B", "B");
const fromArray = List.from(["X", "Y"]);

// Operações (Sempre retornam nova referência)
const unique = List.unique(list); // ["A", "B"]
const withC = List.add(unique, "C"); // ["A", "B", "C"]

// Queries O(1)
const total = List.count(withC); // 3
const empty = List.isEmpty(List.empty()); // true

// Buscas e Duplicatas O(N)
const hasA = List.has(withC, "A"); // true
const hasDup = List.hasDuplicates(list); // true
```

#### APIs disponíveis:
- **Constructors**: `empty()`, `of(...elements)`, `from(iterable)`
- **Operations**: `add(list, el)`, `remove(list, el)`, `map(list, fn)`, `filter(list, predicate)`, `unique(list, keySelector?)`
- **Queries**: `isEmpty(list)`, `count(list)`, `has(list, el)`, `hasDuplicates(list, keySelector?)`
- **Cast**: `toArray(list)`

### Performance & Stress
A biblioteca foi testada sob condições extremas para garantir estabilidade:
- **Carga Massiva**: Suporta até 5.000.000 de itens com operações de escrita entre 15-40ms.
- **Concorrência**: Thread-safe por design (imutabilidade). Testada com 1.000 operações simultâneas sem corrupção de estado.
- **Starvation**: Por ser CPU-bound e síncrona, operações gigantes bloqueiam o Event Loop. Use Workers para processamento em background se necessário.

<Accordion title="Quando usar List">
  Preserve invariantes em objetos de domínio sem expor arrays mutáveis. Sempre que uma entidade/value object aceitar múltiplos valores e precisar de operações derivadas (uniq, count), utilize a `List` imutável para garantir integridade referencial.
</Accordion>