# Higienizando entradas opcionais

## Cenário
Ao registrar um `Referral`, o payload externo pode (ou não) trazer um `primaryCaregiverId`. Queremos manter o campo opcional no agregado, mas impedir que valores vazios ou inválidos escapem da borda.

## Ferramentas
- `Option`, `Some`, `None`
- `guardLet`
- `FamilyMemberId` (value object dependente de `Uuid`)
- `Result`

## Passo a passo

### 1. Converta o payload em `Option`

```ts typescript
import { None, Option, Some } from "@conecta/option";

type ReferralPayload = {
  primaryCaregiverId?: string | null;
};

export const sanitizeCaregiverId = (payload: ReferralPayload): Option<string> => {
  const trimmed = payload.primaryCaregiverId?.trim();
  return trimmed ? Some(trimmed) : None();
};
```

### 2. Promova o valor para o VO correto

```ts typescript
import type { DomainError } from "@conecta/domain-error";
import { None, Option, Some, guardLet } from "@conecta/option";
import { err, ok, Result } from "@conecta/result";
import { FamilyMemberId } from "@conecta/social-care";

export const parseOptionalCaregiver = (
  payload: ReferralPayload,
): Result<Option<FamilyMemberId>, DomainError> => {
  const maybeId = sanitizeCaregiverId(payload);

  // Campo realmente opcional -> devolve None embrulhado em Result
  if (maybeId.isNone) return ok(None());

  const parsed = FamilyMemberId.create(guardLet(maybeId));
  return parsed.isOk ? ok(Some(parsed.unwrap())) : err(parsed.unwrapErr());
};
```

### 3. Use o resultado dentro do agregado

```ts typescript
const caregiverResult = parseOptionalCaregiver(payload);
if (caregiverResult.isErr) {
  // Já recebemos um DomainError de catálogo (ex.: FMIE.InvalidFormat)
  return err(caregiverResult.unwrapErr());
}

const caregiverId = caregiverResult.unwrap();
if (caregiverId.isNone) {
  // nada a fazer neste fluxo
  return ok(patient);
}

return patient.assignPrimaryCaregiver(caregiverId.unwrap());
```

<Accordion title="Quando o campo for obrigatório?">
  Troque o `return ok(None())` por um `err(P.FamilyMemberNotFound({ personId }))` ou outro erro de catálogo. A presença explícita da `Option` continua útil para normalizar o payload e facilitar a instrumentação.
</Accordion>

### Checklist
- Sempre chame `trim`/normalizadores **antes** de decidir `Some` ou `None`.
- Use `guardLet` para destravar `Option` apenas no ponto em que o valor é obrigatório.
- Reaproveite os erros já existentes (`FMIE.InvalidFormat`, `P.FamilyMemberAlreadyExists`, etc.) em vez de lançar `Error`.
