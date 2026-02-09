# Gerando identificadores estáveis

## Cenário
`FamilyMemberId` e `PersonId` precisam aceitar valores externos (quando já existem em outra base) e, ao mesmo tempo, gerar UUID v7 canônicos quando o agregado cria novos registros.

## Ferramentas
- `Uuid` (`src/shared/uuid-pattern`)
- `Result`, `err`, `ok`
- Catálogo de erros específico (`FMIE`, `PID`, etc.)

## Passo a passo

### 1. Implemente o Value Object seguindo o padrão atual

```ts typescript
// src/modules/social-care/domain/value-objects/FamilyMemberId.valueObject.ts
import type { DomainError } from "@conecta/domain-error";
import { err, ok, Result } from "@conecta/result";
import { Uuid } from "@conecta/uuid";
import { FMIE } from "../errors/FamilyMemberId.error";

export class FamilyMemberId {
  private constructor(readonly value: string) {
    Object.freeze(this);
  }

  public static create(): Result<FamilyMemberId, DomainError>;
  public static create(value: string): Result<FamilyMemberId, DomainError>;
  public static create(value?: string): Result<FamilyMemberId, DomainError> {
    if (typeof value === "undefined") {
      // Uuid.create() sem argumentos gera v7 + seq interno e não falha, por isso o unwrap é seguro aqui.
      return ok(new FamilyMemberId(Uuid.create().unwrap().toString()));
    }

    const normalized = value.toLowerCase().trim();
    if (!Uuid.isV7(normalized)) {
      return err(FMIE.InvalidFormat(normalized));
    }

    return ok(new FamilyMemberId(normalized));
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: FamilyMemberId): boolean {
    return this.value === other.value;
  }
}
```

### 2. Utilize nos agregados mantendo o `Result`

```ts typescript
const memberId = FamilyMemberId.create(payload.memberId);
if (memberId.isErr) {
  return err(memberId.unwrapErr());
}

return patient.addFamilyMember(memberId.unwrap());
```

### 3. Gere identificadores em lote quando precisar de sequência

```ts typescript
import { randomInt } from "crypto";
import { Uuid } from "@conecta/uuid";

const rng = { nextInt: (max: number) => randomInt(max) };
let seq = 0;

export const nextUuidV7 = () => {
  const { uuid, nextSeq } = Uuid.generateV7({ rng, seq });
  seq = nextSeq;
  return uuid;
};
```

<Note>
  `Uuid.generateV7` retorna `{ uuid, nextSeq }`. Persistir o `seq` só é necessário se você quiser estabilidade quando múltiplos IDs são emitidos no mesmo milissegundo.
</Note>

### Boas práticas
- Permita que `Uuid.create(value)` trate normalização e validação; evite regex duplicadas no VO.
- Use erros de catálogo (`FMIE.InvalidFormat`, `PID.InvalidFormat`, etc.) para manter rastreabilidade.
- Para logs e eventos, exponha apenas `toString()` ou `equals`, mantendo o valor interno congelado.
