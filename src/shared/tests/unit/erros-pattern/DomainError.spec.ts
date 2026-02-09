import { describe, expect, it } from "bun:test";
import { DomainError } from "@conecta/domain-error";

describe("DomainError (Functional Pattern)", () => {
  const PatientErrors = DomainError.makeFactory({
    bc: "SOCIAL",
    module: "patient",
    codePrefix: "PAT",
    catalog: {
      NotFound: {
        code: "001",
        category: DomainError.Taxonomy.DomainRuleViolation,
        http: 404,
        template: ({ id }) => `Paciente ${id} não encontrado`,
        redact: ["sensitiveData"]
      }
    }
  });

  it("deve criar um erro com ID e código formatados corretamente", () => {
    const error = PatientErrors.NotFound({ id: "123", sensitiveData: "secret" });
    
    expect(error.kind).toBe("NotFound");
    expect(error.code).toBe("PAT-001");
    expect(error.message).toBe("Paciente 123 não encontrado");
    expect(error.bc).toBe("SOCIAL");
    expect(error.module).toBe("patient");
    expect(error.id).toContain("SOCIAL@patient#NotFound-time:");
  });

  it("deve mascarar dados sensíveis no safeContext", () => {
    const error = PatientErrors.NotFound({ id: "123", sensitiveData: "secret" });
    
    expect(error.context.sensitiveData).toBe("secret");
    expect(error.safeContext.sensitiveData).toBe("***");
  });

  it("deve ser imutável (DeepReadonly)", () => {
    const error = PatientErrors.NotFound({ id: "123" });
    
    expect(() => { (error as any).message = "novo"; }).toThrow();
    expect(() => { (error.observability as any).severity = "CRITICAL"; }).toThrow();
  });

  it("shortcuts deve funcionar como esperado", () => {
    const P = DomainError.shortcuts(PatientErrors, {
      NotFound: ["id"]
    });

    const error = P.NotFound("456");
    expect(error.message).toBe("Paciente 456 não encontrado");
    expect(error.context.id).toBe("456");
  });

  it("toHttp deve formatar corretamente", () => {
    const error = PatientErrors.NotFound({ id: "123" });
    const http = PatientErrors.toHttp(error);
    
    expect(http.status).toBe(404);
    expect(http.body.code).toBe("PAT-001");
    expect(http.body.details).toBeDefined();
  });

  it("toTelemetry deve gerar snapshot completo", () => {
    const error = PatientErrors.NotFound({ id: "123" });
    const telemetry = PatientErrors.toTelemetry(error);
    
    expect(telemetry.code).toBe("PAT-001");
    expect(telemetry.fingerprint).toBeDefined();
    expect(telemetry.tags).toBeDefined();
  });

  it("deve renderizar '∅' para valores ausentes no template", () => {
    const Custom = DomainError.makeFactory({
      bc: "T", module: "m",
      catalog: { Err: { code: "1", category: DomainError.Taxonomy.UnexpectedSystemState, template: () => "Val: {val}" } }
    });
    const error = Custom.Err({});
    expect(error.message).toBe("Val: ∅");
  });
});
