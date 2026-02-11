import type { Context } from "hono";
import { Result } from "@conecta/result";
import type { UseCasePort } from "@conecta/ports";
import type { DomainError } from "@conecta/shared/erros-pattern/DomainError";
import type { UpdateSocioEconomicSituationCommand } from "@conecta/social-care/application/ports/commands/update-socioeconomic-situation.command";
import { createUpdateSocioEconomicSituationCommand } from "../../commands/update-socioeconomic-situation.command.adapter";

export const updateSocioEconomicSituationController = (
  useCase: UseCasePort<UpdateSocioEconomicSituationCommand, Result<unknown, DomainError>>
) => async (c: Context) => {
  try {
    const patientId = c.req.param("id");
    const body = c.req.valid("json" as never);
    
    const commandResult = createUpdateSocioEconomicSituationCommand({ situation: body, patientId });
    
    if (Result.isErr(commandResult)) {
      return c.json({ success: false, error: commandResult.error.message }, 400);
    }

    const result = await useCase.execute(commandResult.value);

    if (Result.isErr(result)) {
      const error = result.error as any;
      if (error.code === "NOT_FOUND") return c.json({ success: false, error: error.message }, 404);
      return c.json({ success: false, error: error.message }, 422);
    }

    return c.json({ success: true, data: result.value }, 200);
  } catch (error) {
    console.error("[updateSocioEconomicSituationController] Crash:", error);
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
};
