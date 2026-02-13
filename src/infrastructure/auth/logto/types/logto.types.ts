/**
 * Eventos suportados pelo Logto que iremos processar.
 */
export type LogtoWebhookEvent = 
  | "User.Created" 
  | "User.Data.Updated" 
  | "User.Deleted" 
  | "PostRegister" 
  | "PostSignIn";

/**
 * Payload básico de um Webhook do Logto.
 */
export type LogtoWebhookPayload = {
  readonly hookId: string;
  readonly event: LogtoWebhookEvent;
  readonly createdAt: string;
  readonly user?: {
    readonly id: string;
    readonly username?: string;
    readonly primaryEmail?: string;
    readonly name?: string;
    readonly customData?: Record<string, unknown>;
  };
  readonly data?: Record<string, unknown>; // Para eventos de mutação de API
};

/**
 * Configuração necessária para interagir com a Management API.
 */
export type LogtoManagementConfig = {
  readonly endpoint: string; // Ex: https://auth.acdgbrasil.com.br
  readonly appId: string;
  readonly appSecret: string;
  readonly resource?: string; // Default: https://default.logto.app/api
};
