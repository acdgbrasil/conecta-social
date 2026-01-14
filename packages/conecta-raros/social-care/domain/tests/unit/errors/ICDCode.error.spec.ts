import { describe, expect, test } from "bun:test";
import { ICDError } from "packages/conecta-raros/social-care";

describe("ICDError helpers", () => {
  test("INVALID_CID_NUMBER template usa ∅ para valores ausentes", () => {
    const template = ICDError.catalog.INVALID_CID_NUMBER.template;

    const message = template({
      received: undefined,
      candidate: null,
      expectedPattern: undefined,
    } as any);

    expect(message).toContain("Valor '∅' não representa um CID válido.");
    expect(message).toContain("Candidato normalizado: '∅'.");
    expect(message).toContain("Esperado padrão ∅.");
  });

  test("RetiredCidCode preserva contexto e causa informados", () => {
    const cause = new Error("CID aposentado em tabela oficial");

    const error = ICDError.RetiredCidCode("B11.2", "2020-05-01", cause);

    expect(error.kind).toBe("RETIRED_CID_CODE");
    expect(error.message).toContain("B11.2");
    expect(error.message).toContain("2020-05-01");
    expect(error.cause).toBe(cause);
    expect(error.safeContext).toMatchObject({
      code: "B11.2",
      retiredAt: "2020-05-01",
    });
    expect(ICDError.toHttp(error).status).toBe(409);
  });

  test("ContextConflict inclui o contexto clínico informado", () => {
    const error = ICDError.ContextConflict("C50.9", "gestante");

    expect(error.kind).toBe("ICD_CONTEXT_CONFLICT");
    expect(error.message).toContain("C50.9");
    expect(error.message).toContain("gestante");
    expect(error.safeContext).toMatchObject({
      code: "C50.9",
      context: "gestante",
    });
    expect(error.observability.severity).toBe("ERROR");
  });

  test("InvalidCidNumber injeta flags requireDot/autoDot e padrão correto", () => {
    const error = ICDError.InvalidCidNumber("A001", "A00.1", {
      requireDot: true,
      autoDot: false,
    });

    expect(error.context).toMatchObject({
      received: "A001",
      candidate: "A00.1",
      requireDot: true,
      autoDot: false,
    });
    expect(error.message).toContain(
      "Esperado padrão ^[A-TV-Z]\\d{2}\\.[A-Z0-9]{1,4}$",
    );
  });

  test("EmptyCidCode usa campo padrão quando não informado", () => {
    const error = ICDError.EmptyCidCode();

    expect(error.context.field).toBe("icdCode");
    expect(error.message).toBe(
      "Nenhum CID foi informado para o campo 'icdCode'.",
    );
  });
});
