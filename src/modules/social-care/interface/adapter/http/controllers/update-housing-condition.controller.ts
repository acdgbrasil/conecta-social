import type { Context } from "hono";
import { Result } from "@conecta/result";
import type { UseCasePort } from "@conecta/ports";
import type { DomainError } from "@conecta/shared/erros-pattern/DomainError";
import type { UpdateHousingConditionCommand } from "@conecta/social-care/application/ports/commands/update-housing-condition.command";
import { createUpdateHousingConditionCommand } from "../../commands/update-housing-condition.command.adapter";

export const updateHousingConditionController = (
  useCase: UseCasePort<UpdateHousingConditionCommand, Result<unknown, DomainError>>
) => async (c: Context) => {
  try {
    const patientId = c.req.param("id");
    const body = await c.req.json().catch(() => ({}));
    
    const commandResult = createUpdateHousingConditionCommand({ condition: body, patientId });
    
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
    console.error("[updateHousingConditionController] Crash:", error);
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
};
