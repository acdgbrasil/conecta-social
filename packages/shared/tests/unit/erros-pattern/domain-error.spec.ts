import { describe, expect, test } from "bun:test";
import {
  DomainErrorFactory,
  SpecificDomainError,
  makeDomainErrorFactory,
  ErrorTaxonomy,
  ObservabilitySeverity,
  shortcuts,
} from "@conecta/domain-error";

describe("DomainErrorFactory", () => {
  const fixedNow = new Date("2024-03-10T15:20:30Z");

  const factory = new DomainErrorFactory({
    bc: "CORE",
    module: "users/profile",
    codePrefix: "USR",
    specs: {
      USER_NOT_FOUND: [
        "001",
        (ctx) => `Usuário ${ctx.userId} não encontrado`,
      ],
    },
  });

  test("cria SpecificDomainError com mensagem interpolada e id descritivo", () => {
    const cause = new Error("falha súbita");
    const error = factory.create("USER_NOT_FOUND", {
      ctx: { userId: "abc-123" },
      cause,
      st: "stack-trace",
      now: fixedNow,
    });

    expect(error).toBeInstanceOf(SpecificDomainError);
    expect(error.code).toBe("USR-001");
    expect(error.message).toBe("Usuário abc-123 não encontrado");
    expect(error.context.userId).toBe("abc-123");
    expect(Object.isFrozen(error.context)).toBe(true);
    expect(error.cause).toBe(cause);
    expect(error.stackTrace).toBe("stack-trace");
    expect(error.id).toContain("CORE@users/profile#USER_NOT_FOUND");
    expect(error.id).toContain("tz:America/Fortaleza(-03:00)");
  });

  test("lança erro ao tentar criar tipo sem especificação conhecida", () => {
    expect(() => factory.create("INEXISTENTE" as never)).toThrow(
      "Especificação de erro não encontrada para o tipo: INEXISTENTE",
    );
  });
});

describe("shortcuts", () => {
  test("gera helpers que propagam contexto e causa corretamente", () => {
    const helperImpl = {
      MissingField: (ctx?: Record<string, unknown>, extra?: { cause?: unknown }) => ({
        ctx,
        cause: extra?.cause,
      }),
      InvalidFormat: (ctx?: Record<string, unknown>, extra?: { cause?: unknown }) => ({
        ctx,
        cause: extra?.cause,
      }),
    };

    const spec = {
      MissingField: ["field"],
      InvalidFormat: ["field", "detail"],
    } as const;

    const generated = shortcuts(helperImpl, spec);

    const missingResult = generated.MissingField("name");
    expect(missingResult.ctx).toEqual({ field: "name" });
    expect(missingResult.cause).toBeUndefined();

    const cause = new Error("invalid");
    const invalidResult = generated.InvalidFormat("email", "wrong", cause);
    expect(invalidResult.ctx).toEqual({ field: "email", detail: "wrong" });
    expect(invalidResult.cause).toBe(cause);
  });
});

describe("makeDomainErrorFactory", () => {
  const fixedDate = new Date("2024-04-05T10:15:20Z");

  const catalog = {
    PaymentNotFound: {
      code: "PAY-404",
      template: (ctx: Record<string, unknown>) =>
        `Pagamento ${ctx.paymentId} não encontrado`,
      category: ErrorTaxonomy.DataConsistencyIncident,
      severity: ObservabilitySeverity.Warning,
      http: 404,
      redact: ["secret"],
      tags: { feature: "payments" },
    },
    PaymentIntegrationDown: {
      code: "PAY-500",
      template: () => "Integração de pagamentos indisponível",
      category: ErrorTaxonomy.InfrastructureDependencyFailure,
    },
  } as const;

  const factory = makeDomainErrorFactory({
    bc: "CORE",
    module: "billing/payments",
    catalog,
    now: () => fixedDate,
    redactor: (key, value) => (key === "secret" ? `shielded-${value}` : value),
  });

  test("helper aplica redaction, observabilidade e metadados HTTP", () => {
    const error = factory.PaymentNotFound({
      paymentId: "pay-001",
      secret: "token",
    });

    expect(error.code).toBe("PAY-404");
    expect(error.safeContext).toEqual({
      paymentId: "pay-001",
      secret: "***",
    });
    expect(error.observability.category).toBe(ErrorTaxonomy.DataConsistencyIncident);
    expect(error.observability.severity).toBe(ObservabilitySeverity.Warning);
    expect(error.observability.tags.feature).toBe("payments");

    const httpPayload = factory.toHttp(error);
    expect(httpPayload.status).toBe(404);
    expect(httpPayload.body.details).toEqual(error.safeContext);

    const telemetry = factory.toTelemetry(error);
    expect(telemetry.tags.feature).toBe("payments");
    expect(telemetry.fingerprint).toEqual([
      "CORE",
      "billing/payments",
      ErrorTaxonomy.DataConsistencyIncident,
      "PaymentNotFound",
    ]);

    const infraError = factory.PaymentIntegrationDown();
    const infraHttp = factory.toHttp(infraError);
    expect(infraHttp.status).toBe(400);
  });

  test("toTelemetry resolve metadados padrão para erros desconhecidos", () => {
    const foreignError = new SpecificDomainError({
      id: "foreign-id",
      code: "EXT-1",
      message: "Erro externo",
      bc: "EXTERNAL",
      module: "external/system",
      kind: "AlienError",
      context: {},
    });

    const telemetry = factory.toTelemetry(foreignError as any);
    expect(telemetry.category).toBe(ErrorTaxonomy.UnexpectedSystemState);
    expect(telemetry.severity).toBe(ObservabilitySeverity.Error);
    expect(telemetry.tags.code).toBe("EXT-1");
  });

  test("normalizeCatalog lança quando prefixos são inconsistentes", () => {
    expect(() =>
      makeDomainErrorFactory({
        bc: "CORE",
        module: "billing",
        catalog: {
          InvalidA: {
            code: "FOO-001",
            template: () => "foo",
            category: ErrorTaxonomy.DomainRuleViolation,
          },
          InvalidB: {
            code: "BAR-002",
            template: () => "bar",
            category: ErrorTaxonomy.DomainRuleViolation,
          },
        },
      }),
    ).toThrow(/prefixo inconsistente/i);
  });
});
