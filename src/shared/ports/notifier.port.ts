import type { DomainError } from "@conecta/domain-error/DomainError";
import type { Result } from "@conecta/result";

export type NotifierMessage = {
  channel: "email" | "sms" | "push" | "webhook" | string;
  recipient: string;
  subject?: string;
  body: string;
  metadata?: Record<string, unknown>;
};

/**
 * Contrato para envio de notificações externas (e-mail, push, etc.).
 */
export type NotifierPort = {
  notify(message: NotifierMessage): Promise<Result<void, DomainError>>;
};
