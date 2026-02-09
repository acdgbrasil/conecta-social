import { describe, expect, test } from "bun:test";
import { CommunitySupportNetwork, CSN } from "@conecta/social-care";
import { Result } from "@conecta/result";

describe("CommunitySupportNetwork.valueObject (FP Refactor - RED)", () => {
  const validProps = {
    hasSupportFromRelatives: true,
    hasSupportFromNeighbors: false,
    familyConflicts: "None",
    patientParticipatesInGroups: false,
    familyParticipatesInGroups: false,
    patientHasAccessToLeisure: true,
    facesDiscriminationInCommunity: false
  };

  describe("Factory", () => {
    test("create valida conflitos", () => {
      const result = CommunitySupportNetwork.create({ ...validProps, familyConflicts: "   " });
      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(CSN.FamilyConflictsWhitespace().code);
    });

    test("create normaliza (trim)", () => {
      const result = CommunitySupportNetwork.create({ ...validProps, familyConflicts: "  Test  " });
      expect(Result.isOk(result)).toBe(true);
      expect(Result.unwrap(result).familyConflicts).toBe("Test");
    });
  });
});
