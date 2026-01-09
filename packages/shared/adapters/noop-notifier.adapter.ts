import { NotifierProtocol, NotifierMessage } from "@conecta/protocols";
import { ok } from "@conecta/result";

/**
 * Notificador que não entrega mensagens (útil para testes/ambientes locais).
 */
export const noopNotifier: NotifierProtocol = {
  notify: async (_message: NotifierMessage) => ok(undefined),
};
