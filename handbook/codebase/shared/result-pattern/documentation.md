# @conecta/shared/result-pattern

> Monada `Result<T, E>` usada para expressar sucesso/erro sem exceptions.

## Estrutura
- `ok(value)` → `Result<T, never>`
- `err(error)` → `Result<never, E>`
- `isOk(result)` / `isErr(result)` type guards
- Métodos encadeados: `unwrap`, `unwrapErr`, `map`, `flatMap`

<Note>
  `unwrap` e `unwrapErr` lançam erros ricos via `DomainErrorFactory` se usados no lado errado. Trate os dois ramos explicitamente.
</Note>

## Exemplos

```ts typescript
import { ok, err, isOk, Result } from "@conecta/result";
import { DomainError } from "@conecta/domain-error";

type Email = string;
type EmailError = DomainError;

function parseEmail(raw: string): Result<Email, EmailError> {
  return raw.includes("@")
    ? ok(raw.trim().toLowerCase())
    : err(EmailErrors.InvalidFormat({ raw }));
}

const parsed = parseEmail(input);

if (isOk(parsed)) {
  send(parsed.unwrap());
} else {
  logger.warn(parsed.unwrapErr().message);
}
```

### Encadeando operações

```ts typescript
const created = Timestamp.create({ value: new Date() })
  .flatMap((timestamp) =>
    Diagnosis.create({ id, date: timestamp, description }, now),
  );
```

- `map(fn)` aplica uma transformação no valor quando `Ok`.
- `flatMap(fn)` espera outra função que retorna `Result` e propaga o primeiro `Err` encontrado.

## Convenções
- Nunca use `unwrap` em produção sem antes garantir o ramo (`isOk` / `isErr`).
- Em value objects, prefira retornar `Result` para manter as invariantes e permitir composição com `flatMap`.
- Combine com `Option` quando existir a possibilidade de ausência: `Result<Option<T>, DomainError>`.

## Melhorias Futuras
- [Proposta: Do Notation (com Generators)](./do-notation-proposal.md) — para evitar o "Unwrap Hell" em fluxos sequenciais extensos.
