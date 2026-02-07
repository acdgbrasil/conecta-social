import type { IdProviderPort } from "@conecta/ports";
import { Uuid } from "@conecta/uuid";

/**
 * Provedor default de UUID v7 usando o utilitário do shared kernel.
 */
export const uuidV7Provider: IdProviderPort = {
  generate: () => Uuid.v7().uuid,
};
