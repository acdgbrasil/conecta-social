import { ClockProtocol } from "@conecta/protocols";

/**
 * Implementação padrão baseada em `Date`.
 */
export const systemClock: ClockProtocol = {
  now: () => new Date(),
  nowIsoString: () => new Date().toISOString(),
};
