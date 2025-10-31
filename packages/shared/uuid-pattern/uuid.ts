/**
 * @module @conecta/uuid
 * @description Um Value Object imutável e uma API de utilitários para manuseio de UUIDs.
 *
 * @example
 * ```ts
 * import { Uuid, Version } from '@conecta/uuid';
 * import { randomInt } from 'crypto';
 *
 * // Validar e criar um Uuid a partir de uma string
 * const result = Uuid.create('123e4567-e89b-12d3-a456-426614174000');
 * if (result.isOk) {
 *   const myId = result.unwrap();
 *   console.log(myId.toString()); // '123e4567-e89b-12d3-a456-426614174000'
 *   console.log(myId.getVersion()); // Version.V1
 * }
 *
 * // Gerar um novo UUID v7
 * const rng = { nextInt: (max: number) => randomInt(max) };
 * const newId = Uuid.generateV7({ rng });
 * console.log(`Novo ID v7: ${newId}`);
 * ```
 */
import { err, ok, Result } from "../result-pattern";

/** Enum para identificar a versão de um UUID suportado. */
export enum Version {
  V1 = 'v1',
  V3 = 'v3',
  V4 = 'v4',
  V7 = 'v7',
}

/** Interface para um gerador de números aleatórios injetável. */
export interface Rng {
  nextInt(maxExclusive: number): number;
}

/** Erro lançado quando uma string não representa um UUID válido. */
export class InvalidUuidError extends Error {
  constructor(value: string) {
    super(`O valor fornecido '${value}' não é um UUID suportado.`);
    this.name = "InvalidUuidError";
  }
}

/**
 * Representa um UUID (Universally Unique Identifier) como um Value Object imutável.
 *
 * Esta classe fornece métodos para criar, validar, gerar e inspecionar UUIDs
 * das versões v1, v3, v4 e v7.
 */
export class Uuid {
  // Expressões Regulares para validação, 'i' para case-insensitivity.
  private static readonly RE_V1 = /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  private static readonly RE_V3 = /^[0-9a-f]{8}-[0-9a-f]{4}-3[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  private static readonly RE_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  private static readonly RE_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  readonly value: string;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  /**
   * Cria uma instância de `Uuid` a partir de uma string.
   * A criação só é bem-sucedida se a string for um UUID v1, v3, v4 ou v7 válido.
   *
   * @param value A string a ser validada.
   * @returns Um `Result` contendo a instância de `Uuid` ou um `InvalidUuidError`.
   */
  public static create(): Result<Uuid, InvalidUuidError>;
  public static create(value: string): Result<Uuid, InvalidUuidError>;
  public static create(value?: string): Result<Uuid, InvalidUuidError> {
    if (typeof value === 'undefined') {
      if (!this.autoSeq) this.autoSeq = 0;
      const { uuid, nextSeq } = Uuid.generateV7({
        rng: Uuid.defaultRng,
        seq: this.autoSeq,
      });
      this.autoSeq = nextSeq;
      return ok(uuid);
    }
    if (!Uuid.isSupported(value)) {
      return err(new InvalidUuidError(value));
    }
    return ok(new Uuid(value.toLowerCase()));
  }
  private static autoSeq = 0;
  private static readonly defaultRng: Rng = {
    nextInt(maxExclusive: number) {
      return Math.floor(Math.random() * maxExclusive);
    },
  };

  /** Retorna a representação canônica (lowercase) do UUID. */
  public toString(): string {
    return this.value;
  }

  /** Compara este Uuid com outro para verificar a igualdade. */
  public equals(other?: Uuid): boolean {
    return this.value === other?.value;
  }

  /** Retorna a versão do UUID. */
  public getVersion(): Version | null {
    if (Uuid.isV1(this.value)) return Version.V1;
    if (Uuid.isV3(this.value)) return Version.V3;
    if (Uuid.isV4(this.value)) return Version.V4;
    if (Uuid.isV7(this.value)) return Version.V7;
    return null;
  }

  // --- Métodos Estáticos de Validação ---

  /** Verifica se uma string é um UUID v1 canônico. */
  public static isV1 = (s: string): boolean => Uuid.RE_V1.test(s);
  /** Verifica se uma string é um UUID v3 canônico. */
  public static isV3 = (s: string): boolean => Uuid.RE_V3.test(s);
  /** Verifica se uma string é um UUID v4 canônico. */
  public static isV4 = (s: string): boolean => Uuid.RE_V4.test(s);
  /** Verifica se uma string é um UUID v7 canônico. */
  public static isV7 = (s: string): boolean => Uuid.RE_V7.test(s);

  /** Verifica se uma string é um UUID suportado (v1, v3, v4 ou v7). */
  public static isSupported(s: string): boolean {
    return Uuid.isV1(s) || Uuid.isV3(s) || Uuid.isV4(s) || Uuid.isV7(s);
  }

  // --- Métodos Estáticos de Geração ---

  /** Gera um UUID v4 (aleatório). */
  public static generateV4(rng: Rng): Uuid {
    const bytes = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
      bytes[i] = rng.nextInt(256);
    }
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant RFC 4122
    return new Uuid(Uuid.format(bytes));
  }

  /** Gera um UUID v7 (ordenado por tempo). */
  public static generateV7(
    ctx: { unixMillis?: number; rng: Rng; seq?: number }
  ): { uuid: Uuid; nextSeq: number } {
    const { unixMillis = Date.now(), rng, seq = 0 } = ctx;
    const currentSeq = seq & 0x0fff;

    const bytes = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
      bytes[i] = rng.nextInt(256);
    }

    for (let i = 0; i < 6; i++) {
      bytes[i] = (unixMillis / 2 ** (8 * (5 - i))) & 0xff;
    }

    bytes[6] = 0x70 | ((currentSeq >> 8) & 0x0f);
    bytes[7] = currentSeq & 0xff;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    return {
      uuid: new Uuid(Uuid.format(bytes)),
      nextSeq: (currentSeq + 1) & 0x0fff,
    };
  }

  /** Formata um array de 16 bytes em uma string UUID canônica. */
  private static format(bytes: Uint8Array): string {
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
}
