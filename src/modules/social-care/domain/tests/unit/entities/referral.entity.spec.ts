import { describe, expect, test } from "bun:test";
import {
  RE,
  Referral,
  ReferralDestinationService,
  Timestamp,
} from "@conecta/social-care";
import { Result } from "@conecta/result";
import { Uuid } from "@conecta/uuid";

describe("Referral.entity (FP Refactor - RED)", () => {
  const NOW = new Date();
  const createValidProps = () => ({
    id: Uuid.v7().uuid,
    date: Result.unwrap(Timestamp.create({ value: NOW })),
    requestingProfessionalId: Uuid.v7().uuid,
    referredPersonId: Uuid.v7().uuid,
    destinationService: ReferralDestinationService.CRAS,
    reason: "Reason",
    status: "PENDING" as const
  });

  describe("Factory", () => {
    test("create inicia como PENDING", () => {
      const result = Referral.create(createValidProps(), NOW);
      expect(Result.isOk(result)).toBe(true);
      expect(Result.unwrap(result).status).toBe("PENDING");
    });

    test("create falha data futura", () => {
      const future = Result.unwrap(Timestamp.create({ value: new Date(NOW.getTime() + 10000) }));
      const result = Referral.create({ ...createValidProps(), date: future }, NOW);
      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(RE.DateInFuture().code);
    });

    test("create falha com serviço de destino inválido", () => {
      const result = Referral.create(
        { ...createValidProps(), destinationService: "INVALID" as any },
        NOW,
      );

      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(
        RE.InvalidDestinationService("INVALID", "").code,
      );
    });

    test("create falha com motivo vazio", () => {
      const result = Referral.create({ ...createValidProps(), reason: "   " }, NOW);

      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(RE.ReasonMissing().code);
    });
  });

  describe("Transitions (Namespace Functions)", () => {
    test("complete transita para COMPLETED", () => {
      const initial = Result.unwrap(Referral.create(createValidProps(), NOW));
      const updated = Result.unwrap(Referral.complete(initial));
      expect(updated.status).toBe("COMPLETED");
    });

    test("cancel transita para CANCELLED", () => {
      const initial = Result.unwrap(Referral.create(createValidProps(), NOW));
      const updated = Result.unwrap(Referral.cancel(initial));
      expect(updated.status).toBe("CANCELLED");
    });

    test("falha transição inválida", () => {
      const completed = Result.unwrap(Referral.create({ ...createValidProps(), status: "COMPLETED" }, NOW));
      const result = Referral.cancel(completed);
      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(RE.InvalidStatusTransition("COMPLETED", "CANCELLED").code);
    });

    test("equals compara pelo id", () => {
      const referral = Result.unwrap(Referral.create(createValidProps(), NOW));
      const sameId = { ...referral, reason: "Alterado" };
      const other = Result.unwrap(Referral.create(createValidProps(), NOW));

      expect(Referral.equals(referral, sameId)).toBe(true);
      expect(Referral.equals(referral, other)).toBe(false);
    });
  });
});
