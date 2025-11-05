# Higienizando entradas opcionais

## Cenário
Formulários externos chegam com campos opcionais cheios de espaços ou `null`. Queremos criar um Value Object que só aceite valores limpos, mantendo a API funcional.

## Ferramentas
- `Option`, `Some`, `None`
- `guardLet`
- `Uuid`

## Passo a passo

```ts typescript
import { Option, Some, None, guardLet } from "@conecta/option";
import { Uuid } from "@conecta/uuid";
import { Result, ok, err } from "@conecta/result";
import { PE } from "../err/Patient.error";

type ExternalPayload = {
  caregiverId?: string | null;
};

const sanitizeCaregiver = (payload: ExternalPayload): Option<string> => {
  const raw = payload.caregiverId?.trim();
  return raw ? Some(raw) : None();
};

export const ensureCaregiverId = (
  payload: ExternalPayload,
): Result<Uuid, ReturnType<typeof PE.MissingCaregiver>> => {
  const maybeId = sanitizeCaregiver(payload);

  if (maybeId.isNone) {
    return err(PE.MissingCaregiver("anonymous"));
  }

  const parsed = Uuid.create(guardLet(maybeId));
  return parsed.isOk ? ok(parsed.unwrap()) : err(PE.MissingCaregiver("invalid"));
};
```

<Accordion title="Por que usar Option aqui?">
  `Option` evita checks repetidos (`if (!payload.caregiverId)`) e força o consumo a tratar explicitamente a ausência ou presença do campo.
</Accordion>

### Checkerboard
- Normalize (`trim`) antes de decidir `Some/None`.
- Ao transformar em `Uuid`, sempre trate o `Result` retornado.
- Evite lançar exceções; use `err` para propagar erros de domínio.
