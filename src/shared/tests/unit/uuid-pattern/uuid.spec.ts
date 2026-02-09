import { describe, expect, test } from "bun:test";
import { Uuid } from "@conecta/uuid";
import { Result } from "@conecta/result";

describe("Uuid (Functional Pattern)", () => {
  test("parse aceita UUID válido", () => {
    const validV4 = "123e4567-e89b-42d3-a456-426614174000";
    const result = Uuid.parse(validV4);

    expect(Result.isOk(result)).toBe(true);
    const id = Result.unwrap(result);
    expect(id.toString()).toBe(validV4.toLowerCase());
  });

  test("parse rejeita string inválida", () => {
    const result = Uuid.parse("not-a-uuid");
    
    expect(Result.isErr(result)).toBe(true);
    const err = Result.unwrapErr(result);
    expect(err.kind).toBe("InvalidUuidError");
  });

  test("v4 gera UUID aleatório válido", () => {
    const id = Uuid.v4();
    expect(Uuid.isValid(id)).toBe(true);
    // Verifica bit de versão 4
    expect(id.charAt(14)).toBe("4");
  });

  test("v7 gera UUID sequencial baseado em tempo", () => {
    const unixMillis = Date.UTC(2024, 0, 1, 12, 0, 0);
    const { uuid } = Uuid.v7({ unixMillis, seq: 0 });
    
    expect(Uuid.isValid(uuid)).toBe(true);
    // Verifica bit de versão 7
    expect(uuid.charAt(14)).toBe("7");
  });
});
