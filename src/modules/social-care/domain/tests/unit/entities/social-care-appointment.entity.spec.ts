import { describe, expect, test } from "bun:test";
import {
	SocialCareAppointment,
	SocialCareAppointmentType,
	Timestamp,
	SCAE,
} from "@conecta/social-care";
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

    test("create falha com data no futuro", () => {
      const future = Result.unwrap(
        Timestamp.create({ value: new Date(NOW.getTime() + 60_000) }),
      );
      const result = SocialCareAppointment.create(
        { ...validProps, date: future },
        NOW,
      );

      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(SCAE.DateInFuture().code);
    });

    test("create falha com tipo inválido", () => {
      const result = SocialCareAppointment.create(
        { ...validProps, type: "INVALID" as any },
        NOW,
      );

      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(SCAE.InvalidType("", "").code);
    });

    test("create falha quando resumo e plano estão vazios", () => {
      const result = SocialCareAppointment.create(
        { ...validProps, summary: "   ", actionPlan: "   " },
        NOW,
      );

      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(SCAE.MissingNarrative().code);
    });

    test("create falha quando actionPlan excede limite", () => {
      const result = SocialCareAppointment.create(
        { ...validProps, actionPlan: "a".repeat(2001) },
        NOW,
      );

      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(SCAE.ActionPlanTooLong(2000).code);
    });
  });

  test("equals compara pelo id", () => {
    const appointment = Result.unwrap(SocialCareAppointment.create(validProps, NOW));
    const sameId = { ...appointment, summary: "Outro" };
    const other = Result.unwrap(
      SocialCareAppointment.create({ ...validProps, id: Uuid.v7().uuid }, NOW),
    );

    expect(SocialCareAppointment.equals(appointment, sameId)).toBe(true);
    expect(SocialCareAppointment.equals(appointment, other)).toBe(false);
  });
});
