import type { Context } from "hono";
import { Result } from "@conecta/result";
import type { UseCasePort } from "@conecta/ports";
import type { DomainError } from "@conecta/shared/erros-pattern/DomainError";
import type { RegisterNewPatientCommand } from "@conecta/social-care/application/ports/commands/register-new-patient.command";
import { createRegisterNewPatientCommand } from "../../commands/register-new-patient.command.adapter";

/**
 * Controlador Atômico para Registro de Paciente.
 * Respeita a interface REST: Stateless e Síncrono.
 */
export const registerPatientController = (
  useCase: UseCasePort<RegisterNewPatientCommand, Result<unknown, DomainError>>
) => async (c: Context) => {
  try {
    // 1. Obtém dados validados pelo middleware OpenAPI
    // @ts-ignore
    const body = c.req.valid("json");
    
    // 2. Adaptação para o Comando de Aplicação
    const commandResult = createRegisterNewPatientCommand(body);
    
    if (Result.isErr(commandResult)) {
      return c.json({ 
        success: false, 
        error: commandResult.error.message,
        details: commandResult.error.context 
      }, 400);
    }

    // 3. Execução do Caso de Uso
    const result = await useCase.execute(commandResult.value);

    if (Result.isErr(result)) {
      const error = result.error;
      const status = error.http ?? 422;
      
      return c.json({ 
        success: false, 
        error: error.message 
      }, status as never);
    }

    // 4. Resposta Síncrona (201 Created com cabeçalho Location)
    const data = result.value as { id: string };
    if (data?.id) {
      c.header("Location", `/social-care/patients/${data.id}`);
    }

    return c.json({ 
      success: true, 
      data: result.value 
    }, 201);
  } catch (error) {
    console.error("[registerPatientController] Crash:", error);
    return c.json({ 
      success: false, 
      error: "Internal Server Error" 
    }, 500);
  }
};
