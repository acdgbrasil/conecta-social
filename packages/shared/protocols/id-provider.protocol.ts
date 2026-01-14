/**
 * Provedor de identificadores (ex.: UUID v7).
 */
export type IdProviderProtocol = {
  /**
   * Gera um identificador único para uso no domínio.
   */
  generate(): string;
};
