import { describe, expect, test } from "bun:test";
import { ICDError } from "@conecta/social-care";

describe("ICDError helpers", () => {
  test("INVALID_CID_NUMBER template usa ∅ para valores ausentes", () => {
    // A lib shared renderiza ∅ na MENSAGEM, não no contexto bruto.
    // Usando argumentos posicionais para o shortcut
    const error = ICDError.INVALID_CID_NUMBER(
      undefined as any,
      null as any,
      undefined as any,
    );

    expect(error.message).toContain("Valor '∅' não representa um CID válido.");
    expect(error.message).toContain("Candidato normalizado: '∅'.");
    expect(error.message).toContain("Esperado padrão ∅.");
  });

  test("RETIRED_CID_CODE preserva contexto e causa informados", () => {
    const cause = new Error("CID aposentado");
    const error = ICDError.RETIRED_CID_CODE("B11.2", "2020-05-01", cause);

    expect(error.kind).toBe("RETIRED_CID_CODE");
    expect(error.message).toContain("B11.2");
    expect(error.cause).toBe(cause);
    expect(error.safeContext.code).toBe("B11.2");
  });

  test("EMPTY_CID_CODE mostra ∅ quando campo omitido", () => {
    const error = ICDError.EMPTY_CID_CODE();
    expect(error.message).toContain("campo '∅'");
  });
});