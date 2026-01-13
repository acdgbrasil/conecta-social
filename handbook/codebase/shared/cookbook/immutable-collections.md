# Garantindo invariantes em coleções

## Cenário
`Patient.createFromScratch` precisa validar a lista inicial de diagnósticos sem permitir mutações diretas, duplicatas ou listas vazias.

## Ferramentas
- `ImutableListFactory`, `ImutableList`
- `Result`, `err`, `ok`
- `P` (`packages/conecta-raros/social-care/domain/errors/Patient.error.ts`)

## Passo a passo

### 1. Construa a lista a partir do payload

```ts typescript
import type { Diagnosis } from "@conecta/social-care";
import { ImutableList, ImutableListFactory } from "@conecta/fn";
import { err, ok, Result } from "@conecta/result";
import { P } from "../err/Patient.error";

type Draft = { diagnoses: readonly Diagnosis[] };

export const ensureInitialDiagnoses = (
  draft: Draft,
): Result<ImutableList<Diagnosis>, ReturnType<typeof P.InitialDiagnosesCantBeEmpty>> => {
  const diagnoses = ImutableListFactory.fromArray([...draft.diagnoses]);

  if (diagnoses.isEmpty()) {
    return err(P.InitialDiagnosesCantBeEmpty());
  }

  if (diagnoses.hasDuplicates()) {
    return err(P.InitialDiagnosesCantHaveDuplicates());
  }

  // mantém a referência imutável para o agregado
  return ok(diagnoses);
};
```

### 2. Reutilize as factories para operações subsequentes

Dentro de um método do agregado:

```ts typescript
const updatedDiagnoses = ImutableListFactory.castTolist(patient.diagnoses).add(input);

if (updatedDiagnoses.hasDuplicates()) {
  return err(P.InitialDiagnosesCantHaveDuplicates());
}

return ok(patient.copyWith({ diagnoses: updatedDiagnoses }));
```

### 3. Atualize outras coleções seguindo o padrão

O agregado já faz isso para `appointments`, `referrals` e `violationsReports`:

```ts typescript
const appointments = ImutableListFactory.castTolist(this.appointments).add(appointment);
return ok(this.copyWith({ appointments }));
```

### Pontos de atenção
- Sempre clone arrays externos (`[...draft.diagnoses]`) antes de criar a `ImutableList`.
- `hasDuplicates` é mais barato que `setUnique().count()` e já está disponível no pacote compartilhado.
- Métodos como `add`, `remove` e `setUnique` retornam **novas** listas; nunca mutam a instância anterior, preservando as invariantes do agregado.
