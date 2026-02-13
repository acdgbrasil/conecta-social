import { describe, expect, test } from "bun:test";
import { RightsViolationReport, RVR, Timestamp, ViolationType } from "@conecta/social-care";
import { Result } from "@conecta/result";
import { Uuid } from "@conecta/uuid";

describe("RightsViolationReport.entity (FP Refactor - RED)", () => {
  const NOW = new Date();
  const validProps = {
    id: Uuid.v7().uuid,
    reportDate: Result.unwrap(Timestamp.create({ value: NOW })),
    victimId: Uuid.v7().uuid,
    violationType: ViolationType.NEGLECT,
    descriptionOfFact: "Desc",
    actionsTaken: "Actions"
  };

  describe("Factory", () => {
    test("create valida datas", () => {
      const future = Result.unwrap(Timestamp.create({ value: new Date(NOW.getTime() + 10000) }));
      const result = RightsViolationReport.create({ ...validProps, reportDate: future }, NOW);
      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(RVR.ReportDateInFuture().code);
    });

    test("create falha quando incidente ocorre após o relato", () => {
      const reportDate = Result.unwrap(
        Timestamp.create({ value: new Date("2024-01-10T00:00:00.000Z") }),
      );
      const incidentDate = Result.unwrap(
        Timestamp.create({ value: new Date("2024-01-11T00:00:00.000Z") }),
      );
      const result = RightsViolationReport.create(
        { ...validProps, reportDate, incidentDate },
        NOW,
      );

      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(RVR.IncidentAfterReport().code);
    });

    test("create falha com descrição vazia", () => {
      const result = RightsViolationReport.create(
        { ...validProps, descriptionOfFact: "   " },
        NOW,
      );

      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(RVR.EmptyDescription().code);
    });
  });

  describe("Behavior", () => {
    test("updateActions retorna nova instancia", () => {
      const initial = Result.unwrap(RightsViolationReport.create(validProps, NOW));
      const updated = RightsViolationReport.updateActions(initial, "New Actions");
      
      expect(updated.actionsTaken).toBe("New Actions");
      expect(updated).not.toBe(initial);
    });

    test("equals compara pelo id", () => {
      const report = Result.unwrap(RightsViolationReport.create(validProps, NOW));
      const sameId = { ...report, actionsTaken: "Outro texto" };
      const other = Result.unwrap(
        RightsViolationReport.create({ ...validProps, id: Uuid.v7().uuid }, NOW),
      );

      expect(RightsViolationReport.equals(report, sameId)).toBe(true);
      expect(RightsViolationReport.equals(report, other)).toBe(false);
    });
  });
});
