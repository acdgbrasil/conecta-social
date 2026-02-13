import type { Context } from "hono";
import { Result } from "@conecta/result";
import type { UseCasePort } from "@conecta/ports";
import type { DomainError } from "@conecta/domain-error/DomainError";
import type { RegisterPersonFromLogtoCommand } from "../../../application/ports/commands/register-person-from-logto.command";
import { LogtoSignature } from "@conecta/shared/adapters/logto-signature.verifier";
import type { LogtoWebhookPayload } from "../../../../../../infrastructure/auth/logto/types/logto.types";

/**
 * Controlador de Webhook para processar eventos do Logto.
 * Implementa segurança via HMAC SHA-256.
 */
export const logtoWebhookController = (
  registerPersonUseCase: UseCasePort<RegisterPersonFromLogtoCommand, Result<{ personId: string }, DomainError>>
) => async (c: Context) => {
  try {
    const signature = c.req.header("logto-signature-sha-256");
    const rawBody = await c.req.text();
    const signingKey = Bun.env.LOGTO_WEBHOOK_SECRET;

    // 1. Verificação de Assiduidade e Autenticidade
    const isValid = await LogtoSignature.verify(rawBody, signature, signingKey);
    if (!isValid) {
      console.warn("[LogtoWebhook] Assinatura inválida ou ausente.");
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const payload = JSON.parse(rawBody) as LogtoWebhookPayload;

    // 2. Orquestração baseada no evento
    switch (payload.event) {
      case "User.Created":
      case "PostRegister":
        if (payload.user) {
          const result = await registerPersonUseCase.execute({
            logtoUserId: payload.user.id,
            email: payload.user.primaryEmail ?? "",
            name: payload.user.name,
          });

          if (Result.isErr(result)) {
            console.error("[LogtoWebhook] Falha ao registrar pessoa:", result.error);
            return c.json({ success: false, error: result.error.message }, 422);
          }
        }
        break;

      default:
        console.info(`[LogtoWebhook] Evento ignorado: ${payload.event}`);
    }

    return c.json({ success: true }, 200);
  } catch (error) {
    console.error("[LogtoWebhook] Crash:", error);
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
};
