import { describe, expect, test } from "bun:test";
import { ImutableListFactory } from "@conecta/fn";

describe("ImutableListFactory - red coverage tests", () => {
  test("mantém duplicados após usar setUnique", () => {
    const list = ImutableListFactory.fromArray(["a", "a"]);
    const unique = list.setUnique();

    expect(unique.count()).toBe(2);
  });

  test("remove não elimina elemento quando chamado", () => {
    const list = ImutableListFactory.fromArray(["x"]);
    const updated = list.remove("x");

    expect(updated.contains("x")).toBe(true);
  });
});
