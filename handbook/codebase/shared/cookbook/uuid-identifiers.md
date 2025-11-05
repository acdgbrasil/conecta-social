# Gerando identificadores estáveis

## Cenário
Criar `FamilyMemberId` e `PersonId` garantindo UUID v7 canônico, com suporte a valores externos.

## Ferramentas
- `Uuid`
- `Result`

## Passo a passo

```ts typescript
import { Uuid } from "@conecta/uuid";
import { Result, ok, err } from "@conecta/result";
import { DomainError } from "@conecta/domain-error";
import { FMIE } from "../err/FamilyMemberId.error";

export class FamilyMemberId {
  private constructor(readonly value: Uuid) {
    Object.freeze(this);
  }

  static create(raw?: string): Result<FamilyMemberId, DomainError> {
    if (!raw) {
      return Uuid.create().map((id) => new FamilyMemberId(id));
    }

    const parsed = Uuid.create(raw);
    if (parsed.isErr) return err(FMIE.InvalidFormat(raw));

    return ok(new FamilyMemberId(parsed.unwrap()));
  }

  toString() {
    return this.value.toString();
  }
}
```

```ts typescript
// Uso em um factory de entidade
const familyMemberId = FamilyMemberId.create(externalId);
if (familyMemberId.isErr) {
  throw PE.InvalidFamilyMemberId(externalId);
}

patient.addFamilyMember(familyMemberId.unwrap());
```

### Boas práticas
- Delegue normalização (lowercase) ao `Uuid.create`; não manipule strings manualmente.
- Ao criar automaticamente, capture `seq` retornado por `generateV7` somente se precisar manter a ordenação manual.
- Para logs, exponha apenas `toString()`.
