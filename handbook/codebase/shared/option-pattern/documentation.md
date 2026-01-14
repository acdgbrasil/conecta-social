# @conecta/shared/option-pattern

> Implementação minimalista de `Option<T>` para evitar `null`/`undefined` em regras de domínio.

## TL;DR
- `Some(value)` — embrulha um valor obrigatório.
- `None()` — representa ausência explícita.
- `guardLet` / `ifLet` — utilitários para destravar `Option` dentro de funções puras.

<Note>
  As instâncias são congeladas via `Object.freeze`, portanto não modifique propriedades diretamente.
</Note>

## API

### `Option<T>`
Tipo união com propriedades de verificação rápida.

```ts typescript
import { Option, Some, None } from "@conecta/option";

const maybeCpf: Option<string> = Some("12345678900");

if (maybeCpf.isSome) {
  maybeCpf.value;    // acessa o valor
} else {
  maybeCpf.unwrap(); // lança Error
}
```

Métodos disponíveis em ambos os lados:
- `unwrap()` — recupera o valor ou lança erro (no caso de `None`).
- `unwrapOr(fallback)` — devolve o valor ou o fallback.
- `map(fn)` — aplica transformação e mantém o tipo `Option`.

### `guardLet(option, elseBlock?)`
Destrava `Some` e retorna o valor. Se for `None`, executa `elseBlock()` (quando fornecido) ou lança erro.

```ts typescript
import { guardLet, None } from "@conecta/option";

const token = guardLet(maybeToken, () => crypto.randomUUID());
const never = guardLet(None()); // lança "GuardLet failed"
```

### `ifLet(option)`
Apenas um alias sem `elseBlock`, útil em callbacks curtos.

```ts typescript
const value = ifLet(Some(42));
```

## Boas práticas
- Retorne `Option` apenas quando o fluxo continuar mesmo com ausência (ex: value objects opcionais).
- Prefira `Result` quando precisar carregar um motivo (`DomainError`, por exemplo).
- Sempre converta dados externos (`undefined`, `null`, campos vazios) explicitamente para `Some/None` antes de interagir com as regras de negócio.
