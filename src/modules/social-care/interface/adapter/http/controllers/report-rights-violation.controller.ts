import type { Context } from "hono";
import { Result } from "@conecta/result";
import type { UseCasePort } from "@conecta/ports";
import type { DomainError } from "@conecta/shared/erros-pattern/DomainError";
import type { ReportRightsViolationCommand } from "@conecta/social-care/application/ports/commands/report-rights-violation.command";
import { createReportRightsViolationCommand } from "../../commands/report-rights-violation.command.adapter";

/**
 * Controlador Atômico para Relato de Violação de Direitos.
 * Respeita a interface REST: Stateless e Síncrono.
 */
export const reportRightsViolationController = (
  useCase: UseCasePort<ReportRightsViolationCommand, Result<unknown, DomainError>>
) => async (c: Context) => {
  try {
    const patientId = c.req.param("id");
    const body = await c.req.json().catch(() => ({}));
    
    // 1. Adaptação para o Comando de Aplicação (Mesclando o ID da URL)
    const commandResult = createReportRightsViolationCommand({ ...body, patientId });
    
    if (Result.isErr(commandResult)) {
      return c.json({ 
        success: false, 
        error: commandResult.error.message,
        details: commandResult.error.context 
      }, 400);
    }

    // 2. Execução do Caso de Uso
    const result = await useCase.execute(commandResult.value);

    if (Result.isErr(result)) {
      const error = result.error;
      const status = error.http ?? 422;
      return c.json({ 
        success: false, 
        error: error.message 
      }, status as never);
    }

    const reportId = (result.value as any)?.id;
    if (patientId && reportId) {
      c.header("Location", `/social-care/patients/${patientId}/rights-violations/${reportId}`);
    }

    return c.json({ 
      success: true, 
      data: result.value 
    }, 201);
  } catch (error) {
    console.error("[reportRightsViolationController] Crash:", error);
    return c.json({ 
      success: false, 
      error: "Internal Server Error" 
    }, 500);
  }
};
