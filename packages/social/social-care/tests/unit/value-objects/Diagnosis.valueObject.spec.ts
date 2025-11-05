import { describe, expect, test } from "bun:test";
import { Diagnosis, ICDCode, Timestamp } from "@conecta/social-care";

const VALID_DESCRIPTION = "Paciente apresentou diagnóstico confirmado.";
const NOW = Timestamp.create({ value: new Date("2024-05-10T00:00:00Z") }).unwrap();
const VALID_DATE = Timestamp.create({ value: new Date("2024-05-01T00:00:00Z") }).unwrap();
const VALID_ICD_CODE = ICDCode.create("B20.1").unwrap();

describe("Diagnosis.valueObject", () => {
  test("cria diagnóstico válido com dados consistentes", () => {
    const result = Diagnosis.create({ id: VALID_ICD_CODE, date: VALID_DATE, description: VALID_DESCRIPTION }, NOW);

    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    const diagnosis = result.unwrap();
    expect(diagnosis.id).toBe(VALID_ICD_CODE);
    expect(diagnosis.date).toBe(VALID_DATE);
    expect(diagnosis.description).toBe(VALID_DESCRIPTION);
    expect(Object.isFrozen(diagnosis)).toBe(true);
  });

  test("falha ao criar diagnóstico com código CID inválido", () => {
    const result = ICDCode.create("invalid-code");
    expect(result.isErr).toBe(true);
  });

  test("falha ao criar diagnóstico com data no futuro", () => {
    const futureDate = Timestamp.create({ value: new Date("2024-05-11T00:00:00Z") }).unwrap();
    const result = Diagnosis.create({ id: VALID_ICD_CODE, date: futureDate, description: VALID_DESCRIPTION }, NOW);

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.error.code).toBe("DIAG-001");
  });

  test("falha ao criar diagnóstico com ano anterior a zero", () => {
    const pastDate = Timestamp.create({ value: new Date("-000001-01-01T00:00:00Z") }).unwrap();
    const result = Diagnosis.create({ id: VALID_ICD_CODE, date: pastDate, description: VALID_DESCRIPTION }, NOW);

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.error.code).toBe("DIAG-002");
  });

  test("falha ao criar diagnóstico com descrição vazia", () => {
    const result = Diagnosis.create({ id: VALID_ICD_CODE, date: VALID_DATE, description: " " }, NOW);

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.error.code).toBe("DIAG-003");
  });

  test("remove espaços excedentes da descrição antes de persistir", () => {
    const result = Diagnosis.create(
      { id: VALID_ICD_CODE, date: VALID_DATE, description: "  Doença respiratória aguda  " },
      NOW,
    );

    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    expect(result.unwrap().description).toBe("Doença respiratória aguda");
  });
});
