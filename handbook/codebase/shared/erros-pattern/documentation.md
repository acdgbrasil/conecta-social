# @conecta/shared/erros-pattern

> Sistema de erros de domínio com catálogo tipado, metadados de observabilidade e atalhos para construtores.

<Note>
  Este pacote já é consumido por `social-care`. Ao evoluir o catálogo de um módulo, atualize os testes do pacote de origem e sincronize esta documentação.
</Note>

## Quando usar
- Criar erros ricos em contexto em bounded contexts que seguem DDD.
- Propagar falhas com código estável (`PREFIXO-###`) e fingerprint previsível.
- Formatar respostas HTTP/telemetria sem duplicar lógica nos handlers.

Evite usar para exceptions genéricas de infraestrutura: prefira erros nativos da camada (`Error`, `AggregateError`, etc.).

## APIs principais

### `makeDomainErrorFactory`
Constrói uma fábrica de alto nível a partir de um catálogo declarativo. Cada chave do catálogo gera um helper com a mesma assinatura.

```ts typescript
import { makeDomainErrorFactory, ErrorTaxonomy } from "@conecta/domain-error";

const PatientErrors = makeDomainErrorFactory({
  bc: "SOCIAL",
  module: "social-care/patient",
  catalog: {
    MissingCaregiver: {
      code: "PAT-001",
      category: ErrorTaxonomy.DomainRuleViolation,
      template: ({ patientId }) =>
        `Paciente ${patientId} exige pelo menos um cuidador vinculado.`,
      http: 422,
      tags: { stage: "intake" },
    },
  },
});

throw PatientErrors.MissingCaregiver({ patientId });
```

Cada erro criado contém:
- `code`, `message`, `bc`, `module`, `kind`
- `id` descritivo com timestamp em Fortaleza (UTC-3)
- `context` imutável e `safeContext` com campos redigidos
- `observability` com `category`, `severity`, `tags` e `fingerprint`

### `toHttp` e `toTelemetry`
Expondo erros para transportes externos sem quebrar a imutabilidade.

```ts typescript
const error = PatientErrors.MissingCaregiver({ patientId });

const { status, body } = PatientErrors.toHttp(error);
// status => 422, body => { code, message, category, severity, ... }

logger.error("patient.validation", PatientErrors.toTelemetry(error));
```

### `shortcuts(factory, spec)`
Cria helpers com assinatura variádica, útil quando o catálogo é consumido em value objects.

```ts typescript
import { shortcuts } from "@conecta/domain-error";

const PatientErrors = makeDomainErrorFactory({ /* ... */ });

export const PE = shortcuts(PatientErrors, {
  MissingCaregiver: ["patientId"],
  InvalidCpf: ["cpf", "reason"],
});

throw PE.InvalidCpf("12345678900", "checksum mismatch");
```

### `DomainErrorFactory`
Usar apenas em cenários legados onde o catálogo completo não é necessário. Ele expõe um método `create(kind, options)` que devolve `SpecificDomainError`.

## Convenções
- Prefixo (`codePrefix`) precisa ser o mesmo para todas as entradas do catálogo. O helper valida isso.
- Use `redact` no catálogo para mascarar campos sensíveis antes de enviar logs.
- Preferir `ErrorTaxonomy` + `ObservabilitySeverity` para padronizar dashboards.

<Accordion title="Diferença entre `context` e `safeContext`">
  `context` mantém o payload completo. `safeContext` aplica `redact` + `redactor` e é usado em retornos HTTP/telemetria. Ao serializar em logs externos, prefira o segundo.
</Accordion>

## Testes sugeridos
- Para cada helper gerado, cubra `toHttp` e `toTelemetry` com assertions sobre `category`, `severity` e redaction.
- Garanta que `shortcuts` propaga `cause` corretamente (`shortcuts(factory, spec)` aceita argumento extra no final).
