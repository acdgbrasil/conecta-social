import { describe, expect, test } from "bun:test";
import { ImutableListFactory } from "@conecta/fn";

describe("ImutableListFactory - regressões prevenidas", () => {
  //Corrigido na branch fix/fix_all_tests_was_failling_in_06_11_2025
  test("[CR-IML-01] setUnique elimina duplicados e mantém ordem original", () => {
    const list = ImutableListFactory.fromArray(["a", "a", "b"]);

    const unique = ImutableListFactory.setUnique(list);

    expect(ImutableListFactory.count(unique)).toBe(2);
    expect(ImutableListFactory.getAll(unique)).toEqual(["a", "b"]);
  });

  //Corrigido na branch fix/fix_all_tests_was_failling_in_06_11_2025
  test("[CR-IML-02] remove remove o elemento alvo e não reaproveita referência", () => {
    const list = ImutableListFactory.fromArray(["x"]);

    const updated = ImutableListFactory.remove(list, "x");

    expect(ImutableListFactory.contains(updated, "x")).toBe(false);
    expect(ImutableListFactory.count(updated)).toBe(0);
    expect(updated).not.toBe(list);
  });
});
