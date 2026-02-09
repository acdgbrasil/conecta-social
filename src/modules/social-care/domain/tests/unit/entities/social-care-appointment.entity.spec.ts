import { describe, expect, test } from "bun:test";
import { SocialCareAppointment, SocialCareAppointmentType, Timestamp } from "@conecta/social-care";
import { Result } from "@conecta/result";
import { Uuid } from "@conecta/uuid";

describe("SocialCareAppointment.entity (FP Refactor - RED)", () => {
  const NOW = new Date();
  const validProps = {
    id: Uuid.v7().uuid,
    date: Result.unwrap(Timestamp.create({ value: NOW })),
    professionalInChargeId: Uuid.v7().uuid,
    type: SocialCareAppointmentType.HOME_VISIT,
    summary: "Summary",
    actionPlan: "Plan"
  };

  describe("Factory", () => {
    test("create valida limites", () => {
      const longSummary = "a".repeat(501);
      const result = SocialCareAppointment.create({ ...validProps, summary: longSummary }, NOW);
      expect(Result.isErr(result)).toBe(true);
    });
  });
});
