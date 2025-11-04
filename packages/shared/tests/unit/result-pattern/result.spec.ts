import { describe, expect, test } from "bun:test";
import { ok, err, isOk, isErr } from "@conecta/result";
import { SpecificDomainError } from "@conecta/domain-error";

describe("Result", () => {
  test("ok mantém valor e permite map/flatMap encadeados", () => {
    const result = ok(2);
    const mapped = result.map((value) => value + 3);
    const flatMapped = result.flatMap((value) => ok(value * 2));

    expect(mapped.unwrap()).toBe(5);
    expect(flatMapped.unwrap()).toBe(4);
    expect(isOk(result)).toBe(true);
    expect(isErr(result)).toBe(false);
  });

  test("err propaga erro e ignora transformações", () => {
    const originalError = new Error("falha");
    const result = err(originalError);

    const mapped = result.map((value) => value);
    const flatMapped = result.flatMap((value) => ok(value));

    expect(mapped.unwrapErr()).toBe(originalError);
    expect(flatMapped.unwrapErr()).toBe(originalError);
    expect(isOk(result)).toBe(false);
    expect(isErr(result)).toBe(true);
  });

  test("unwrap em Err lança SpecificDomainError com código RES-002", () => {
    const result = err(new Error("falha"));

    expect(() => result.unwrap()).toThrow(SpecificDomainError);
    try {
      result.unwrap();
    } catch (error) {
      if (error instanceof SpecificDomainError) {
        expect(error.code).toBe("RES-002");
        expect(error.message).toContain("Called unwrap on an Err result");
      }
    }
  });

  test("unwrapErr em Ok lança SpecificDomainError com código RES-001", () => {
    const result = ok("valor");

    expect(() => result.unwrapErr()).toThrow(SpecificDomainError);
    try {
      result.unwrapErr();
    } catch (error) {
      if (error instanceof SpecificDomainError) {
        expect(error.code).toBe("RES-001");
        expect(error.message).toContain("Called unwrapErr on an Ok result");
      }
    }
  });
});
