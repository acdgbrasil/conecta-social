import { IdProviderProtocol } from "@conecta/protocols";
import { Uuid } from "@conecta/uuid";

/**
 * Provedor default de UUID v7 usando o utilitário do shared kernel.
 */
export const uuidV7Provider: IdProviderProtocol = {
  generate: () => Uuid.create().unwrap().toString(),
};
