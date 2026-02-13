import type { Context } from "hono";
import { Result } from "@conecta/result";
import type { UseCasePort } from "@conecta/ports";
import type { DomainError } from "@conecta/shared/erros-pattern/DomainError";
import type { RemoveFamilyMemberCommand } from "@conecta/social-care/application/ports/commands/remove-family-member.command";
import { createRemoveFamilyMemberCommand } from "../../commands/remove-family-member.command.adapter";

export const removeFamilyMemberController = (
  useCase: UseCasePort<RemoveFamilyMemberCommand, Result<unknown, DomainError>>
) => async (c: Context) => {
  try {
    const patientId = c.req.param("id");
    const memberPersonId = c.req.param("memberId");
    
    const commandResult = createRemoveFamilyMemberCommand({ patientId, memberPersonId });
    
    if (Result.isErr(commandResult)) {
      return c.json({ success: false, error: commandResult.error.message }, 400);
    }

    const result = await useCase.execute(commandResult.value);

    if (Result.isErr(result)) {
      const error = result.error;
      const status = error.http ?? 422;
      return c.json({ success: false, error: error.message }, status as never);
    }

    return c.json({ success: true, data: result.value }, 200);
  } catch (error) {
    console.error("[removeFamilyMemberController] Crash:", error);
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
};
