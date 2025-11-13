# Construindo catálogos de erros consistentes

## Cenário
O agregado `Patient` delega toda validação para erros de domínio ricos (`@conecta/domain-error`). Precisamos manter catálogo, atalhos e integração HTTP alinhados ao que está versionado em `packages/social/social-care/err`.

## Ferramentas
- `makeDomainErrorFactory`
- `shortcuts`
- `ErrorTaxonomy`, `ObservabilitySeverity`

## Passo a passo

### 1. Declare o catálogo com as mesmas chaves usadas no domínio

```ts typescript
// packages/social/social-care/err/Patient.error.ts
import {
  ErrorTaxonomy,
  ObservabilitySeverity,
  makeDomainErrorFactory,
  shortcuts,
} from "@conecta/domain-error";

export type PatientErrorKind =
  | "InitialDiagnosesCantBeEmpty"
  | "InitialDiagnosesCantHaveDuplicates"
  | "FamilyMemberAlreadyExists"
  | "FamilyMemberNotFound";

export const PatientErrors = makeDomainErrorFactory<PatientErrorKind>({
  bc: "SOCIAL",
  module: "social-care/patient",
  codePrefix: "PAT",
  catalog: {
    InitialDiagnosesCantBeEmpty: {
      code: "PAT-001",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: () => "Paciente não pode ser criado sem um diagnóstico inicial.",
    },
    InitialDiagnosesCantHaveDuplicates: {
      code: "PAT-010",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: () =>
        "Paciente não pode ser criado com diagnósticos iniciais duplicados.",
    },
    FamilyMemberAlreadyExists: {
      code: "PAT-005",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: ({ memberId }) =>
        `O membro da família '${memberId}' já está associado a este paciente.`,
      tags: { aggregate: "Patient" },
    },
    FamilyMemberNotFound: {
      code: "PAT-006",
      http: 404,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: ({ personId }) =>
        `Nenhum membro da família associado ao PersonId '${personId}' foi encontrado.`,
    },
  },
});
```

### 2. Gere atalhos com `shortcuts`

```ts typescript
export const P = shortcuts(PatientErrors, {
  InitialDiagnosesCantBeEmpty: [] as const,
  InitialDiagnosesCantHaveDuplicates: [] as const,
  FamilyMemberAlreadyExists: ["memberId"] as const,
  FamilyMemberNotFound: ["personId"] as const,
});

// Atalhos aceitam um `cause` opcional como último argumento:
// err(P.FamilyMemberAlreadyExists(memberId, originalError));
```

### 3. Use no agregado e exponha para outras camadas

```ts typescript
// packages/social/social-care/entities/Patient.entity.ts
import { err, ok } from "@conecta/result";
import { P, PatientErrors } from "../err/Patient.error";

if (diagnoses.isEmpty()) {
  return err(P.InitialDiagnosesCantBeEmpty());
}

if (diagnoses.hasDuplicates()) {
  return err(P.InitialDiagnosesCantHaveDuplicates());
}

// Em um controller/application service
const result = patient.addFamilyMember(member);
if (result.isErr) {
  const { status, body } = PatientErrors.toHttp(result.error);
  reply.status(status).json(body);
  logger.warn(result.error.message, PatientErrors.toTelemetry(result.error));
}
```

### 4. Adicione metadados de observabilidade quando necessário

Quando precisar mascarar campos ou atribuir severidade, siga o padrão que já está em `ICDCode.error.ts`:

```ts typescript
const ICDCodeErrorCatalog = {
  INVALID_CID_NUMBER: {
    code: "ICD-001",
    template: ({ received, candidate, expectedPattern }) =>
      `Valor '${received}' não representa um CID válido. Normalizado: '${candidate}'. Esperado padrão ${expectedPattern}.`,
    category: ErrorTaxonomy.DomainRuleViolation,
    severity: ObservabilitySeverity.Warning,
    http: 422,
    redact: ["received"],
    tags: { cause: "invalid_cid" },
  },
  // ...
} as const;
```

<Note>
  `makeDomainErrorFactory` já retorna helpers prontos (`PatientErrors.FamilyMemberNotFound`). Use `shortcuts` apenas quando quiser apelidos curtos (`P.FamilyMemberNotFound`) ou normalizar a ordem de argumentos.
</Note>

### Checklist de qualidade
- `catalog` e `codePrefix` refletem exatamente os códigos presentes em `packages/social/social-care/err`.
- Campos sensíveis aparecem em `redact` sempre que usarmos valores externos (`received`, `reason`, etc.).
- Sempre exponha erros através de `toHttp`/`toTelemetry` fora do domínio, garantindo payload consistente com os handlers atuais.
