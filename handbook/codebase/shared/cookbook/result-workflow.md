# Orquestrando value objects com Result

## Cenário
`Diagnosis.create` depende de três value objects (`ICDCode`, `Timestamp`, `Diagnosis`). Queremos compor a validação do payload de forma sequencial, abortando no primeiro erro e propagando o `DomainError` correto.

## Ferramentas
- `Result` (`flatMap`, `isOk`, `unwrap`)
- Value objects já exportados por `@conecta/social-care`
- `DiagnosisErrors` (`packages/social/social-care/err/Diagnosis.error.ts`)

## Passo a passo

```ts typescript
import type { DomainError } from "@conecta/domain-error";
import { Diagnosis, ICDCode, Timestamp } from "@conecta/social-care";
import { Result } from "@conecta/result";

type CreateDiagnosisInput = {
  readonly icdCode: string;
  readonly occurredAt: string;
  readonly description: string;
};

export const createDiagnosis = (
  input: CreateDiagnosisInput,
): Result<Diagnosis, DomainError> =>
  ICDCode.create(input.icdCode, { requireDot: true }).flatMap((cid) =>
    Timestamp.create({ value: new Date(input.occurredAt) }).flatMap((date) =>
      Timestamp.create({ value: new Date() }).flatMap((now) =>
        Diagnosis.create(
          {
            id: cid,
            date,
            description: input.description,
          },
          now,
        ),
      ),
    ),
  );
```

### Tratando o resultado no application service

```ts typescript
import { DiagnosisErrors } from "../err/Diagnosis.error";

const result = createDiagnosis(payload);

if (result.isErr) {
  const { status, body } = DiagnosisErrors.toHttp(result.error);
  reply.status(status).json(body);
  return;
}

const diagnosis = result.unwrap();
await diagnosisRepository.save(diagnosis);
```

### Dicas
- `flatMap` evita blocos `if (result.isErr) return err(...)` a cada etapa, mantendo o pipeline linear.
- `unwrap` só deve ser usado depois de `isOk`; fora disso, prefira `result.error` ou `result.unwrapErr()` para manter o contrato da monada.
- Value objects devem continuar retornando `Result` (como `Timestamp.create` e `Diagnosis.create`) para que toda a árvore de chamadas compartilhe o mesmo mecanismo de falha.
