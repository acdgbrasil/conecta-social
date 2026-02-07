import { describe, expect, test } from "bun:test";
import { TE, Timestamp } from "@conecta/social-care";
import { Result } from "@conecta/result";

describe("Timestamp.valueObject (FP Refactor - RED)", () => {
  const dateA = new Date("2024-01-10T12:00:00Z");
  const dateB_later = new Date("2024-01-11T12:00:00Z");
  const dateC_earlier = new Date("2024-01-09T12:00:00Z");

  describe("1. Criação (Factory) e Validação", () => {
    test("deve criar um Timestamp válido a partir de um objeto Date", () => {
      const result = Timestamp.create({ value: dateA });
      expect(Result.isOk(result)).toBe(true);
    });

    test("createFromISOString aceita string ISO válida", () => {
        const result = Timestamp.createFromISOString("2024-05-10T03:00:00Z");
        expect(Result.isOk(result)).toBe(true);
    });

    const invalidCases = [
      { name: "data inválida (NaN)", value: new Date("isto não é uma data") },
      { name: "valor null", value: null },
      { name: "valor undefined", value: undefined },
    ];

    test.each(invalidCases)("deve FALHAR ao criar a partir de $name (regra TS-001)", ({ value }) => {
      const result = Timestamp.create({ value: value as any });
      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(TE.InvalidDate({ value: "" }).code);
    });
  });

  describe("2. Imutabilidade e Pureza", () => {
    test("[CR-1] deve ser imune a mutações no objeto Date original", () => {
      const originalDate = new Date("2024-01-01T12:00:00Z");
      const timestamp = Result.unwrap(Timestamp.create({ value: originalDate }));

      // Mutação maliciosa externa
      originalDate.setFullYear(2099);

      expect(Timestamp.getFullYear(timestamp)).toBe(2024);
    });

    test("toDate deve retornar um clone seguro (ou nova instancia)", () => {
        const timestamp = Result.unwrap(Timestamp.create({ value: dateA }));
        const dateClone = Timestamp.toDate(timestamp);
        
        dateClone.setFullYear(2099);
        expect(Timestamp.getFullYear(timestamp)).toBe(2024);
    });
  });

  describe("3. Funções de Comparação (Namespace)", () => {
    const tsA = Result.unwrap(Timestamp.create({ value: dateA }));
    const tsLater = Result.unwrap(Timestamp.create({ value: dateB_later }));
    const tsEarlier = Result.unwrap(Timestamp.create({ value: dateC_earlier }));

    test("isAfter(a, b)", () => {
      expect(Timestamp.isAfter(tsA, tsEarlier)).toBe(true);
      expect(Timestamp.isAfter(tsA, tsLater)).toBe(false);
    });

    test("isBefore(a, b)", () => {
      expect(Timestamp.isBefore(tsA, tsLater)).toBe(true);
      expect(Timestamp.isBefore(tsA, tsEarlier)).toBe(false);
    });

    test("equals(a, b)", () => {
      const tsACopy = Result.unwrap(Timestamp.create({ value: new Date(dateA) }));
      expect(Timestamp.equals(tsA, tsACopy)).toBe(true);
      expect(Timestamp.equals(tsA, tsLater)).toBe(false);
    });
  });

  describe("4. Getters Funcionais", () => {
    test("toISOString(ts) retorna string formatada", () => {
      const ts = Result.unwrap(Timestamp.createFromISOString("2024-05-10T03:00:00Z"));
      expect(Timestamp.toISOString(ts)).toBe("2024-05-10T03:00:00.000Z");
    });

    test("getFullYear(ts) retorna ano", () => {
      const ts = Result.unwrap(Timestamp.createFromISOString("2025-01-01T00:00:00Z"));
      expect(Timestamp.getFullYear(ts)).toBe(2025);
    });
  });

  describe("5. Evolução (Substituindo copyWith por create)", () => {
    test("deve criar nova instância via spread e create", () => {
      const initial = Result.unwrap(Timestamp.create({ value: dateA }));
      
      const updatedResult = Timestamp.create({ value: dateB_later }); // Timestamp is branded Date, not object with props
      // Actually Timestamp.create expects { value: Date }, so we pass new props
      
      expect(Result.isOk(updatedResult)).toBe(true);
      const updated = Result.unwrap(updatedResult);
      
      expect(Timestamp.equals(updated, initial)).toBe(false);
      expect(Timestamp.isAfter(updated, initial)).toBe(true);
    });
  });
});
