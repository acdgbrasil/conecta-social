# Orquestrando value objects com Result

## Cenário
Ao registrar um diagnóstico, precisamos validar o CID, o timestamp e a descrição em cadeia, abortando no primeiro erro.

## Ferramentas
- `Result`, `ok`, `err`, `isOk`
- Value objects (`ICDCode`, `Timestamp`, `Diagnosis`)

## Passo a passo

```ts typescript
import { ICDCode, Timestamp, Diagnosis } from "@conecta/social-care";
import { Result, ok, err } from "@conecta/result";
import { DE } from "../err/Diagnosis.error";

type CreateDiagnosisInput = {
  icdCode: string;
  occurredAt: string;
  description: string;
};

export const createDiagnosis = (
  input: CreateDiagnosisInput,
): Result<Diagnosis, ReturnType<typeof DE.DescriptionEmpty>> => {
  const cid = ICDCode.create(input.icdCode, { requireDot: true });
  if (cid.isErr) return err(cid.error);

  const date = Timestamp.create({ value: new Date(input.occurredAt) });
  if (date.isErr) return err(date.error);

  const now = Timestamp.create({ value: new Date() }).unwrap();

  const diagnosis = Diagnosis.create(
    {
      id: cid.unwrap(),
      date: date.unwrap(),
      description: input.description,
    },
    now,
  );

  return diagnosis.isOk ? diagnosis : err(diagnosis.error);
};
```

### Dicas
- Evite misturar `try/catch` com `Result`. Prefira retornar `err` nos value objects.
- Quando precisar do valor, use `if (result.isOk)` antes de chamar `unwrap`.
- Para pipelines longos, considere helpers reutilizáveis (`flatMap`) para reduzir `if` encadeados.
