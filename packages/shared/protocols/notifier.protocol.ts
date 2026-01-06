import { DomainError } from "@conecta/domain-error";
import { Result } from "@conecta/result";

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
export type NotifierProtocol = {
  notify(message: NotifierMessage): Promise<Result<void, DomainError>>;
};
