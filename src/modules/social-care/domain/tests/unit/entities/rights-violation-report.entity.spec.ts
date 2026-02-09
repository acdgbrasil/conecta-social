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
  });

  describe("Behavior", () => {
    test("updateActions retorna nova instancia", () => {
      const initial = Result.unwrap(RightsViolationReport.create(validProps, NOW));
      const updated = RightsViolationReport.updateActions(initial, "New Actions");
      
      expect(updated.actionsTaken).toBe("New Actions");
      expect(updated).not.toBe(initial);
    });
  });
});
