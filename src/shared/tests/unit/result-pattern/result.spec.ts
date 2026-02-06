import { describe, expect, test } from "bun:test";
import { SpecificDomainError } from "@conecta/domain-error";
import { err, isErr, isOk, ok, Result } from "@conecta/result";

describe("Result", () => {
  test("ok mantém valor e permite map/flatMap encadeados", () => {
    const result = ok(2);
    const mapped = Result.map(result, (value) => value + 3);
    const flatMapped = Result.flatMap(result, (value) => ok(value * 2));

    expect(Result.unwrap(mapped)).toBe(5);
    expect(Result.unwrap(flatMapped)).toBe(4);
    expect(isOk(result)).toBe(true);
    expect(isErr(result)).toBe(false);
  });

  test("err propaga erro e ignora transformações", () => {
    const originalError = new Error("falha");
    const result = err(originalError);

    const mapped = Result.map(result, (value) => value);
    const flatMapped = Result.flatMap(result, (value) => ok(value));

    expect(Result.unwrapErr(mapped)).toBe(originalError);
    expect(Result.unwrapErr(flatMapped)).toBe(originalError);
    expect(isOk(result)).toBe(false);
    expect(isErr(result)).toBe(true);
  });

  test("unwrap em Err lança Error genérico", () => {
    const result = err(new Error("falha"));

    expect(() => Result.unwrap(result)).toThrow(Error);
    expect(() => Result.unwrap(result)).toThrow("Called unwrap on an Err result");
  });

  test("unwrapErr em Ok lança Error genérico", () => {
    const result = ok("valor");

    expect(() => Result.unwrapErr(result)).toThrow(Error);
    expect(() => Result.unwrapErr(result)).toThrow("Called unwrapErr on an Ok result");
  });
});
