import { describe, expect, test } from "bun:test";
import { DE, Diagnosis, ICDCode, Timestamp } from "@conecta/social-care";
import { Result } from "@conecta/result";

describe("Diagnosis.valueObject (FP Refactor - RED)", () => {
  const NOW = Result.unwrap(Timestamp.create({ value: new Date("2024-05-10T00:00:00Z") }));
  const VALID_DATE = Result.unwrap(Timestamp.create({ value: new Date("2024-05-01T00:00:00Z") }));
  const VALID_ICD = Result.unwrap(ICDCode.create("B20.1"));

  describe("Factory", () => {
    test("cria diagnóstico válido", () => {
      const props = { id: VALID_ICD, date: VALID_DATE, description: "Confirmado" };
      const result = Diagnosis.create(props, NOW); 
      
      expect(Result.isOk(result)).toBe(true);
      const diag = Result.unwrap(result);
      expect(diag.id).toBe(VALID_ICD);
      expect(diag.description).toBe("Confirmado");
    });

    test("falha com data futura", () => {
      const future = Result.unwrap(Timestamp.create({ value: new Date("2024-05-11T00:00:00Z") }));
      const result = Diagnosis.create({ id: VALID_ICD, date: future, description: "Test" }, NOW);
      
      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(DE.DateInFuture("", "").code);
    });

    test("falha com descrição vazia", () => {
      const result = Diagnosis.create({ id: VALID_ICD, date: VALID_DATE, description: "  " }, NOW);
      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(DE.DescriptionEmpty().code);
    });
  });

  describe("Evolução (Substitui copyWith)", () => {
    test("create aplica validação ao atualizar via spread", () => {
      const original = Result.unwrap(Diagnosis.create({ id: VALID_ICD, date: VALID_DATE, description: "Original" }, NOW));
      
      // Update description
      const updatedResult = Diagnosis.create({ ...original, description: "Updated" }, NOW);
      expect(Result.isOk(updatedResult)).toBe(true);
      expect(Result.unwrap(updatedResult).description).toBe("Updated");

      // Update invalid date
      const future = Result.unwrap(Timestamp.create({ value: new Date("2024-05-11T00:00:00Z") }));
      const invalidResult = Diagnosis.create({ ...original, date: future }, NOW);
      expect(Result.isErr(invalidResult)).toBe(true);
    });
  });
});
