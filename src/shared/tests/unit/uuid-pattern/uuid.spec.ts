import { describe, expect, test } from "bun:test";
import { InvalidUuidError, Uuid, Version } from "@conecta/uuid";
import { Result } from "@conecta/result";

const makeDeterministicRng = (values: number[]) => {
  let index = 0;
  return {
    nextInt(maxExclusive: number) {
      const value = values[index % values.length] % maxExclusive;
      index += 1;
      return value;
    },
  };
};

describe("Uuid utilities", () => {
  test("create sem argumento gera UUID v7 válido", () => {
    const result = Uuid.create();

    expect(result.isOk).toBe(true);
    if (result.isOk) {
      const uuid = Result.unwrap(result);
      expect(Uuid.isV7(uuid.toString())).toBe(true);
      expect(uuid.getVersion()).toBe(Version.V7);
    }
  });

  test("create com valor inválido retorna InvalidUuidError", () => {
    const result = Uuid.create("not-a-uuid");

    expect(result.isErr).toBe(true);
    if (result.isErr) {
      expect(result.error).toBeInstanceOf(InvalidUuidError);
    }
  });

  test("create aceita string válida e preserva versão", () => {
    const validV4 = "123e4567-e89b-42d3-a456-426614174000";
    const result = Uuid.create(validV4);

    expect(result.isOk).toBe(true);
    if (result.isOk) {
      const uuid = Result.unwrap(result);
      expect(uuid.toString()).toBe(validV4.toLowerCase());
      expect(uuid.getVersion()).toBe(Version.V4);
      expect(uuid.equals(uuid)).toBe(true);
    }
  });

  test("generateV4 utiliza RNG determinístico e seta bits de versão/variante", () => {
    const rngValues = Array.from({ length: 16 }, (_, index) => index * 7);
    const rng = makeDeterministicRng(rngValues);
    const uuid = Uuid.generateV4(rng);
    const asString = uuid.toString();

    expect(Uuid.isV4(asString)).toBe(true);
    expect(asString[14]).toBe("4"); // versão
    expect(["8", "9", "a", "b"]).toContain(asString[19]); // variante RFC 4122
  });

  test("generateV7 respeita timestamp e seq fornecidos", () => {
    const rng = makeDeterministicRng([0]);
    const unixMillis = Date.UTC(2024, 0, 1, 12, 0, 0);
    const { uuid, nextSeq } = Uuid.generateV7({
      unixMillis,
      rng,
      seq: 0x0ffe,
    });

    expect(nextSeq).toBe(0x0fff);
    const asString = uuid.toString();
    expect(Uuid.isV7(asString)).toBe(true);

    const expectedPrefixSegments = (() => {
      const bytes: number[] = [];
      for (let i = 0; i < 6; i++) {
        bytes.push((unixMillis / 2 ** (8 * (5 - i))) & 0xff);
      }
      const hex = bytes
        .map((value) => value.toString(16).padStart(2, "0"))
        .join("");
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-`;
    })();

    expect(asString.startsWith(expectedPrefixSegments)).toBe(true);
  });

  test("helpers de validação identificam versões suportadas", () => {
    expect(Uuid.isSupported("123e4567-e89b-12d3-a456-426614174000")).toBe(true); // v1
    expect(Uuid.isSupported("123e4567-e89b-32d3-a456-426614174000")).toBe(true); // v3
    expect(Uuid.isSupported("123e4567-e89b-42d3-a456-426614174000")).toBe(true); // v4
    expect(Uuid.isSupported("123e4567-e89b-72d3-a456-426614174000")).toBe(true); // v7
    expect(Uuid.isSupported("invalid-uuid-format")).toBe(false);
  });
});
