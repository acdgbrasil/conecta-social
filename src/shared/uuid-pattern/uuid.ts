import type { Branded } from "@conecta/fn";
import { type Result, Result as R } from "@conecta/result";

/**
 * Representa um UUID validado e tipado nominalmente.
 * Em runtime é apenas uma string, garantindo zero overhead de serialização/deserialização.
 */
export type Uuid = Branded<string, "Uuid">;

export type InvalidUuidError = {
  readonly kind: "InvalidUuidError";
  readonly message: string;
  readonly value: string;
};

// Expressões Regulares para validação (case-insensitive)
const RE = {
  V1: /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  V3: /^[0-9a-f]{8}-[0-9a-f]{4}-3[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  V4: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  V7: /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
};

/**
 * Interface para injeção de dependência do gerador de números aleatórios.
 */
export type Rng = {
  nextInt(maxExclusive: number): number;
};

const defaultRng: Rng = {
  nextInt: (max) => Math.floor(Math.random() * max),
};

// --- Funções Puras ---

const isV1 = (s: string): boolean => RE.V1.test(s);
const isV3 = (s: string): boolean => RE.V3.test(s);
const isV4 = (s: string): boolean => RE.V4.test(s);
const isV7 = (s: string): boolean => RE.V7.test(s);

const isValid = (s: string): boolean => isV1(s) || isV3(s) || isV4(s) || isV7(s);

/**
 * Cria um UUID a partir de uma string existente.
 * Retorna Result.ok(Uuid) se válido, ou Result.err(InvalidUuidError).
 */
const create = (value: string): Result<Uuid, InvalidUuidError> => {
  if (isValid(value)) {
    return R.ok(value.toLowerCase() as Uuid);
  }
  return R.err({
    kind: "InvalidUuidError",
    message: `O valor '${value}' não é um UUID suportado (v1, v3, v4, v7).`,
    value,
  });
};

/** Alias para create, mantendo compatibilidade com parse antigo */
const parse = create;

/**
 * Gera um novo UUID v4 (aleatório).
 */
const v4 = (rng: Rng = defaultRng): Uuid => {
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = rng.nextInt(256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant RFC 4122
  return format(bytes) as Uuid;
};

/**
 * Gera um novo UUID v7 (ordenado por tempo).
 */
const v7 = (
  options: {
    unixMillis?: number;
    rng?: Rng;
    seq?: number;
  } = {},
): { uuid: Uuid; nextSeq: number } => {
  const { unixMillis = Date.now(), rng = defaultRng, seq = 0 } = options;
  const currentSeq = seq & 0x0fff;

  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = rng.nextInt(256);
  }

  // Timestamp (48 bits)
  for (let i = 0; i < 6; i++) {
    bytes[i] = (unixMillis / 2 ** (8 * (5 - i))) & 0xff;
  }

  // Version 7 e Sequence
  bytes[6] = 0x70 | ((currentSeq >> 8) & 0x0f);
  bytes[7] = currentSeq & 0xff;

  // Variant RFC 4122
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return {
    uuid: format(bytes) as Uuid,
    nextSeq: (currentSeq + 1) & 0x0fff,
  };
};

/** Formata bytes para string (helper interno). */
const format = (bytes: Uint8Array): string => {
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return (
    `${hex.substring(0, 8)}-` +
    `${hex.substring(8, 12)}-` +
    `${hex.substring(12, 16)}-` +
    `${hex.substring(16, 20)}-` +
    `${hex.substring(20)}`
  );
};

// --- Namespace Público ---

export const Uuid = {
  create,
  parse,
  v4,
  v7,
  isValid: (s: string): s is Uuid => isValid(s),
  isV7: (s: string): boolean => isV7(s),
};
