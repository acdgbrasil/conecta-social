import type { ClockPort } from "@conecta/ports";

/**
 * Implementação padrão baseada em `Date`.
 */
export const systemClock: ClockPort = {
  now: () => new Date(),
  nowIsoString: () => new Date().toISOString(),
};
