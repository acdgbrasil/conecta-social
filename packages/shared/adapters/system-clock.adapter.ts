import { ClockProtocol } from "../protocols/clock.protocol";

/**
 * Implementação padrão baseada em `Date`.
 */
export const systemClock: ClockProtocol = {
  now: () => new Date(),
  nowIsoString: () => new Date().toISOString(),
};
