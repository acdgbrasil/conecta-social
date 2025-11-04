import { describe, expect, test } from "bun:test";
import { Some, None } from "@conecta/option";

describe("Option", () => {
  test("Some encapsula valor com flags corretas", () => {
    const option = Some("valor");

    expect(option.isSome).toBe(true);
    expect(option.isNone).toBe(false);
    expect(option.value).toBe("valor");
  });

  test("None representa ausência de valor", () => {
    const option = None();

    expect(option.isSome).toBe(false);
    expect(option.isNone).toBe(true);
    expect("value" in option).toBe(false);
  });
});
