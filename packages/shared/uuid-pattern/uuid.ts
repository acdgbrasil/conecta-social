/**
 * Utilitários atômicos para UUIDs (v1, v3, v4, v7) com funções simples e
 * portáteis para validar, inspecionar e gerar UUIDs em formato canônico.
 *
 * Visão Geral
 * - Suporta validação para versões v1, v3, v4 e v7 em formato canônico
 * (com hifens, maiúsculas/minúsculas aceitas).
 * - Funções de geração para v1 (baseado em tempo), v4 (aleatório) e v7
 * (ordenado por tempo) em formato de string canônica.
 * - Pequenos utilitários para inferir a versão e canonizar.
 *
 * Exemplo: validar e detectar a versão
 * ```typescript
 * import { isUuidSupported, uuidVersionOf, Version } from './uuid';
 *
 * const s = '123e4567-e89b-12d3-a456-426614174000';
 * const ok = isUuidSupported(s);       // true
 * const v  = uuidVersionOf(s);         // Version.V1
 * ```
 *
 * Exemplo: gerar v4 (aleatório)
 * ```typescript
 * // A forma moderna e recomendada:
 * const id = crypto.randomUUID();
 *
 * // Usando a função para injetar um RNG (útil para testes):
 * const rng = { nextInt: (max: number) => Math.floor(Math.random() * max) };
 * const idCustom = genUuidV4(rng);
 * ```
 *
 * Exemplo: gerar v7 (ordenado por tempo)
 * ```typescript
 * let seq = 0x5AA; // 1450
 * const rng = { nextInt: (max: number) => Math.floor(Math.random() * max) };
 *
 * const result = genUuidV7({
 * unixMillis: Date.now(),
 * rng,
 * seq,
 * });
 *
 * const uuid = result.uuid;
 * seq = result.nextSeq; // Use este valor na próxima chamada
 * ```
 *
 * Exemplo: gerar v1 (baseado em tempo)
 * ```typescript
 * const clockSeq14 = 0x2AAA & 0x3FFF;
 *
 * // Nó de 48 bits (6 bytes)
 * const node48 = new Uint8Array([0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF]);
 *
 * // Em JS, Date.now() retorna milissegundos. Simulamos microssegundos.
 * const unixMicrosUtc = BigInt(Date.now()) * 1000n;
 *
 * const id = genUuidV1({ unixMicrosUtc, clockSeq14, node48 });
 * ```
 */

/** Enum auxiliar para identificar a versão de um UUID suportado. */
export enum Version {
  V1 = 'v1',
  V3 = 'v3',
  V4 = 'v4',
  V7 = 'v7',
}

// Expressões Regulares usam a flag 'i' para case-insensitivity.
const RE_V1 = /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RE_V3 = /^[0-9a-f]{8}-[0-9a-f]{4}-3[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RE_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RE_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Retorna `true` se `s` for uma string UUID v1 canônica. */
export function isUuidV1(s: string): boolean {
  return RE_V1.test(s);
}

/** Retorna `true` se `s` for uma string UUID v3 canônica. */
export function isUuidV3(s: string): boolean {
  return RE_V3.test(s);
}

/** Retorna `true` se `s` for uma string UUID v4 canônica. */
export function isUuidV4(s: string): boolean {
  return RE_V4.test(s);
}

/** Retorna `true` se `s` for uma string UUID v7 canônica. */
export function isUuidV7(s: string): boolean {
  return RE_V7.test(s);
}

/** Válido se for v1, v3, v4 ou v7 (formato canônico com hifens). */
export function isUuidSupported(s: string): boolean {
  return isUuidV1(s) || isUuidV3(s) || isUuidV4(s) || isUuidV7(s);
}

/** Retorna a versão detectada para o UUID `s`, ou `null` se não for suportado. */
export function uuidVersionOf(s: string): Version | null {
  if (isUuidV1(s)) return Version.V1;
  if (isUuidV3(s)) return Version.V3;
  if (isUuidV4(s)) return Version.V4;
  if (isUuidV7(s)) return Version.V7;
  return null;
}

/** Retorna `s` em minúsculas se for canônico e suportado; caso contrário, `null`. */
export function uuidCanonicalOrNull(s: string): string | null {
  return isUuidSupported(s) ? s.toLowerCase() : null;
}

/**
 * Interface simples para um gerador de números aleatórios, para ser injetado
 * nas funções de geração de UUID.
 */
export interface Rng {
  /** Retorna um inteiro aleatório no intervalo [0, maxExclusive). */
  nextInt(maxExclusive: number): number;
}

// --- v4 (random) ---
/**
 * Gera uma string UUID v4 (aleatória) canônica usando um `rng`.
 *
 * **Nota**: Na maioria dos ambientes JS (browsers, Node.js), é preferível usar
 * a API nativa `crypto.randomUUID()` por ser mais segura e performática.
 */
export function genUuidV4(rng: Rng): string {
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = rng.nextInt(256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant RFC 4122
  return formatUuid(bytes);
}

// --- v7 (time-ordered) ---
/** Contexto para a geração de UUID v7. */
export type UuidV7Ctx = {
  /** Milissegundos UTC atuais. */
  unixMillis: number;
  /** Fonte de números aleatórios. */
  rng: Rng;
  /** Sequência de 12 bits (0..4095). */
  seq: number;
};

/**
 * Generates a UUID version 7 (Unix timestamp-based) according to RFC 4122.
 *
 * @remarks
 * UUID v7 is a time-based UUID that combines:
 * - 48-bit Unix timestamp in milliseconds (provides temporal ordering)
 * - 12-bit sequence number (prevents collisions within the same millisecond)
 * - 4-bit version identifier (0111 for v7)
 * - 2-bit variant (10 for RFC 4122)
 * - 62-bit random data (provides uniqueness)
 *
 * The function follows the UUID v7 specification and ensures monotonic ordering
 * when called sequentially with incrementing sequence numbers.
 *
 * @param ctx - The UUID v7 context object containing generation parameters
 * @param ctx.unixMillis - Current Unix timestamp in milliseconds (number)
 *   Represents the time when the UUID is being generated. This value is used
 *   to populate the first 48 bits of the UUID, enabling temporal ordering of UUIDs.
 *   Example: 1704067200000 (Jan 1, 2024 00:00:00 UTC)
 *
 * @param ctx.rng - Random number generator instance (RNG provider)
 *   Must provide a `nextInt(max: number)` method that returns random integers.
 *   Used to fill the random bits in the UUID. The generator should provide
 *   cryptographically secure random values for production use.
 *   Example: Crypto.getRandomValues() or similar implementation
 *
 * @param ctx.seq - 12-bit sequence number (number)
 *   Used to ensure uniqueness when multiple UUIDs are generated in the same
 *   millisecond. The value is masked to 12 bits (0x0fff) to maintain the
 *   correct bit length. Should be incremented between calls for the same timestamp.
 *   Example: 0 to 4095 (2^12 - 1)
 *
 * @returns An object containing:
 * @returns `.uuid` - The generated UUID v7 as a formatted string (e.g., "550e8400-e29b-41d4-a716-446655440000")
 * @returns `.nextSeq` - The incremented sequence number (12-bit) for the next UUID generation.
 *   This value wraps around after reaching 4095 and resets to 0.
 *
 * @example
 * ```typescript
 * const rng = { nextInt: (max: number) => Math.floor(Math.random() * max) };
 * const ctx = {
 *   unixMillis: Date.now(),
 *   rng,
 *   seq: 0
 * };
 *
 * const { uuid, nextSeq } = genUuidV7(ctx);
 * console.log(uuid);    // "018f7d8a-5a3c-7000-8abc-def012345678"
 * console.log(nextSeq); // 1
 *
 * // For subsequent calls in the same millisecond:
 * const result2 = genUuidV7({ ...ctx, seq: nextSeq });
 * // UUID will be different due to incremented sequence number
 * ```
 *
 * @throws Does not throw, but relies on valid context parameters
 */
export function genUuidV7(ctx: UuidV7Ctx): { uuid: string; nextSeq: number } {
  const { unixMillis, rng, seq } = ctx;
  const currentSeq = seq & 0x0fff; // Garante 12 bits

  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = rng.nextInt(256);
  }

  // Timestamp (48 bits, big-endian) -> bytes[0..5]
  for (let i = 0; i < 6; i++) {
    bytes[i] = (unixMillis / 2 ** (8 * (5 - i))) & 0xff;
  }

  // version 7 + high(seq)
  bytes[6] = 0x70 | ((currentSeq >> 8) & 0x0f);
  // low(seq)
  bytes[7] = currentSeq & 0xff;

  // variant RFC 4122
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return { uuid: formatUuid(bytes), nextSeq: (currentSeq + 1) & 0x0fff };
}

// --- v1 (time-based) ---
/** Contexto para a geração de UUID v1. */
export type UuidV1Ctx = {
  /**
   * Microssegundos UTC atuais. Use `BigInt` para evitar perda de precisão.
   * Ex: `BigInt(Date.now()) * 1000n`
   */
  unixMicrosUtc: bigint;
  /** Sequência de clock de 14 bits (0..16383). */
  clockSeq14: number;
  /** Identificador de nó de 6 bytes (48 bits). */
  node48: Uint8Array;
};

/** Gera uma string UUID v1 (baseada em tempo) canônica a partir do `ctx`. */
/**
 * Generates a UUID v1 (time-based) according to RFC 4122 specification.
 *
 * UUID v1 is generated using a timestamp (in 100-nanosecond intervals since October 15, 1582),
 * a clock sequence for uniqueness, and a node identifier (MAC address or random 48-bit value).
 *
 * @param {Context} ctx - The UUID v1 context containing:
 *   - `unixMicrosUtc` - Unix timestamp in microseconds (UTC)
 *   - `clockSeq14` - 14-bit clock sequence for handling timestamp collisions
 *   - `node48` - 6-byte node identifier (typically a MAC address or random multicast address)
 *
 * @returns A string representation of the UUID v1 in the standard format (8-4-4-4-12 hex digits)
 *
 * @throws {Error} When `ctx.node48` does not have exactly 6 bytes
 *
 * @example
 * ```typescript
 * const ctx: UuidV1Ctx = {
 *   unixMicrosUtc: BigInt(Date.now()) * 1000n,
 *   clockSeq14: Math.floor(Math.random() * 0x4000),
 *   node48: new Uint8Array([0x00, 0x1A, 0x2B, 0x3C, 0x4D, 0x5E])
 * };
 * const uuid = genUuidV1(ctx);
 * // Result: "550e8400-e29b-41d4-a716-446655440000"
 * ```
 *
 * @remarks
 * - The function converts Unix timestamp (microseconds) to 100-nanosecond intervals since 1582
 * - The node identifier's least significant bit is set to 1 to mark it as a multicast address
 * - The UUID structure follows RFC 4122: time_low (4 bytes) + time_mid (2 bytes) + time_hi_version (2 bytes) +
 *   clock_seq_hi_reserved (1 byte) + clock_seq_low (1 byte) + node (6 bytes)
 * - Version field is set to 0x1 (bits 12-15 of time_hi_and_version)
 * - Variant field is set to RFC 4122 (10xx xxxx in bits 6-7 of clock_seq_hi_and_reserved)
 */
export function genUuidV1(ctx: UuidV1Ctx): string {
  // 100ns desde 1582-10-15. Use `n` para BigInt.
  const epochDiff100ns = 0x01b21dd213814000n;
  const ts100ns = ctx.unixMicrosUtc * 10n + epochDiff100ns;

  // Campos de tempo (operações com BigInt)
  const timeLow = ts100ns & 0xffffffffn;
  const timeMid = (ts100ns >> 32n) & 0xffffn;
  const timeHi = (ts100ns >> 48n) & 0x0fffn; // 12 bits úteis

  // Sequência de clock (14 bits)
  const cs = ctx.clockSeq14 & 0x3fff;

  // Nó (48 bits) — garante 6 bytes; seta o bit multicast/local
  if (ctx.node48.length !== 6) {
    throw new Error('node48 deve ter exatamente 6 bytes');
  }
  const node = Uint8Array.from(ctx.node48);
  node[0] |= 0x01;

  const b = new Uint8Array(16);

  // time_low
  b[0] = Number((timeLow >> 24n) & 0xffn);
  b[1] = Number((timeLow >> 16n) & 0xffn);
  b[2] = Number((timeLow >> 8n) & 0xffn);
  b[3] = Number(timeLow & 0xffn);

  // time_mid
  b[4] = Number((timeMid >> 8n) & 0xffn);
  b[5] = Number(timeMid & 0xffn);

  // time_hi_and_version (versão 1)
  const tihv = Number(timeHi | 0x1000n);
  b[6] = (tihv >> 8) & 0xff;
  b[7] = tihv & 0xff;

  // clock_seq_hi_and_reserved (variant 10xx xxxx)
  b[8] = ((cs >> 8) & 0x3f) | 0x80;
  // clock_seq_low
  b[9] = cs & 0xff;

  // node
  b.set(node, 10);

  return formatUuid(b);
}

// --- utilitário interno ---
/** Formata um array de 16 bytes em uma string UUID canônica. */
function formatUuid(bytes: Uint8Array): string {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return (
    `${hex.substring(0, 8)}-` +
    `${hex.substring(8, 12)}-` +
    `${hex.substring(12, 16)}-` +
    `${hex.substring(16, 20)}-` +
    `${hex.substring(20)}`
  );
}