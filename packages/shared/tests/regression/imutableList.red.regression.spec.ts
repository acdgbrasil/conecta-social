import { describe, expect, test } from "bun:test";
import { ImutableListFactory } from "@conecta/fn";

describe("ImutableListFactory - regressões prevenidas", () => {
  test("[CR-IML-01] setUnique elimina duplicados e mantém ordem original", () => {
    const list = ImutableListFactory.fromArray(["a", "a", "b"]);

    const unique = list.setUnique();

    expect(unique.count()).toBe(2);
    expect(unique.getAll()).toEqual(["a", "b"]);
  });

  test("[CR-IML-02] remove remove o elemento alvo e não reaproveita referência", () => {
    const list = ImutableListFactory.fromArray(["x"]);

    const updated = list.remove("x");

    expect(updated.contains("x")).toBe(false);
    expect(updated.count()).toBe(0);
    expect(updated).not.toBe(list);
  });
});
