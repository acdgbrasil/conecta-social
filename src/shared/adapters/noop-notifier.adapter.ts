import type { NotifierMessage, NotifierPort } from "@conecta/ports";
import { Result } from "@conecta/result";

/**
 * Notificador que não entrega mensagens (útil para testes/ambientes locais).
 */
export const noopNotifier: NotifierPort = {
  notify: async (_message: NotifierMessage) => Result.ok(undefined),
};
