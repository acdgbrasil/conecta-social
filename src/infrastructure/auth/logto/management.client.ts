import { Result } from "@conecta/result";
import { AppError } from "@conecta/social-care/application/errors/application.error";
import type { LogtoManagementConfig } from "./types/logto.types";

/**
 * Factory funcional para o Cliente da Management API do Logto.
 * Implementa cache de token e operações seguras.
 */
export const makeLogtoManagementClient = (config: LogtoManagementConfig) => {
  let cachedToken: string | null = null;
  let tokenExpiry = 0;

  const resource = config.resource ?? "https://default.logto.app/api";

  /**
   * Obtém um token de acesso válido via Client Credentials.
   */
  const getAccessToken = async (): Promise<Result<string, Error>> => {
    // 1. Verifica cache (com buffer de 1 minuto)
    if (cachedToken && Date.now() < tokenExpiry - 60000) {
      return Result.ok(cachedToken);
    }

    try {
      const response = await fetch(`${config.endpoint}/oidc/token`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${Buffer.from(`${config.appId}:${config.appSecret}`).toString("base64")}`
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          resource: resource,
          scope: "all",
        }),
      });

      if (!response.ok) {
        return Result.err(new Error(`Failed to get Logto token: ${response.statusText}`));
      }

      const data = await response.json() as { access_token: string; expires_in: number };
      cachedToken = data.access_token;
      tokenExpiry = Date.now() + (data.expires_in * 1000);

      return Result.ok(cachedToken);
    } catch (error) {
      return Result.err(error as Error);
    }
  };

  /**
   * Atualiza o customData de um usuário.
   */
  const updateUserCustomData = async (userId: string, customData: Record<string, unknown>) => {
    const tokenResult = await getAccessToken();
    if (Result.isErr(tokenResult)) return tokenResult;

    try {
      const response = await fetch(`${config.endpoint}/api/users/${userId}/custom-data`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${tokenResult.value}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customData }),
      });

      return response.ok 
        ? Result.ok(true) 
        : Result.err(new Error(`Failed to update custom data: ${response.statusText}`));
    } catch (error) {
      return Result.err(error as Error);
    }
  };

  return {
    updateUserCustomData,
    // Futuras operações (suspendUser, listRoles, etc) podem ser adicionadas aqui
  };
};
