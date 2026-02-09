/**
 * Provedor de identificadores (ex.: UUID v7).
 */
export type IdProviderPort = {
  /**
   * Gera um identificador único para uso no domínio.
   */
  generate(): string;
};
