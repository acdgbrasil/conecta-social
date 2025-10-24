import { describe, expect, test } from "bun:test";
import { Diagnosis } from "../Diagnosis.valueObject";

const VALID_DESCRIPTION = "Paciente apresentou diagnóstico confirmado.";
const VALID_DATE = new Date("2024-05-01T00:00:00Z");

describe("Diagnosis.valueObject", () => {
  test("cria diagnóstico válido com dados consistentes", () => {
    const result = Diagnosis.create("b201", VALID_DATE, VALID_DESCRIPTION);

    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    const diagnosis = result.unwrap();
    expect(diagnosis.id).toBe("B20.1");
    expect(diagnosis.date).toBe(VALID_DATE);
    expect(diagnosis.description).toBe(VALID_DESCRIPTION);
    expect(Object.isFrozen(diagnosis)).toBe(true);
  });

  test("falha ao criar diagnóstico com código CID inválido", () => {
    const result = Diagnosis.create("invalid-code", VALID_DATE, VALID_DESCRIPTION);

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.error.code).toBe("ICD-001");
  });

  test("falha ao criar diagnóstico com data no futuro", () => {
    const future = new Date(Date.now() + 60_000);
    const result = Diagnosis.create("A00", future, VALID_DESCRIPTION);

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.error.code).toBe("DIAG-001");
  });

  test("falha ao criar diagnóstico com ano anterior a zero", () => {
    const past = new Date(0);
    past.setFullYear(-1);
    const result = Diagnosis.create("A00", past, VALID_DESCRIPTION);

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.error.code).toBe("DIAG-002");
  });

  test("falha ao criar diagnóstico com descrição vazia", () => {
    const result = Diagnosis.create("A00", VALID_DATE, " ");

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.error.code).toBe("DIAG-003");
  });
});
