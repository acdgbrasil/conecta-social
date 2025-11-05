# Construindo catálogos de erros consistentes

## Cenário
Precisamos expor falhas de validação de `Patient` com códigos estáveis, logs estruturados e respostas HTTP padronizadas.

## Ferramentas
- `makeDomainErrorFactory`
- `shortcuts`
- `ErrorTaxonomy`, `ObservabilitySeverity`

## Passo a passo

```ts typescript
// packages/social/social-care/err/Patient.error.ts
import {
  ErrorTaxonomy,
  ObservabilitySeverity,
  makeDomainErrorFactory,
  shortcuts,
} from "@conecta/domain-error";

const PatientErrorFactory = makeDomainErrorFactory({
  bc: "SOCIAL",
  module: "social-care/patient",
  catalog: {
    MissingCaregiver: {
      code: "PAT-001",
      category: ErrorTaxonomy.DomainRuleViolation,
      template: ({ patientId }) =>
        `Paciente ${patientId} exige pelo menos um cuidador vinculado.`,
      http: 422,
      tags: { aggregate: "Patient" },
    },
    SuspendedRecord: {
      code: "PAT-002",
      category: ErrorTaxonomy.UnexpectedSystemState,
      severity: ObservabilitySeverity.Warning,
      template: ({ patientId, reason }) =>
        `Não é possível editar ${patientId}: prontuário suspenso (${reason}).`,
      http: 409,
      redact: ["reason"],
    },
  },
});

export const PE = shortcuts(PatientErrorFactory, {
  MissingCaregiver: ["patientId"],
  SuspendedRecord: ["patientId", "reason"],
});
```

```ts typescript
// packages/social/social-care/entities/Patient.entity.ts
import { PE, PatientErrorFactory } from "../err/Patient.error";
import { err, ok } from "@conecta/result";

const result = caregiverIds.isEmpty()
  ? err(PE.MissingCaregiver(patientId.toString()))
  : ok(patient);

if (result.isErr) {
  const { status, body } = PatientErrorFactory.toHttp(result.error);
  reply.status(status).json(body);
}
```

<Note>
  `shortcuts` permite adicionar um `cause` extra passada como último argumento: `PE.SuspendedRecord(id, reason, causeError)`.
</Note>

### Checklist de qualidade
- catalogue `code` usa prefixo único (`PAT`).
- campos sensíveis (ex.: `reason`) marcados em `redact`.
- cada erro recebe tags suficientes para dashboards (`aggregate`, `bc`, `module` já vêm automáticos).
