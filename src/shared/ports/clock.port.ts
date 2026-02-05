/**
 * Fonte de tempo injetável para evitar dependência direta de `Date.now()`.
 */
export type ClockPort = {
  /**
   * Retorna um objeto Date representando o instante atual.
   */
  now(): Date;

  /**
   * Retorna o instante atual em ISO 8601.
   */
  nowIsoString(): string;
};
