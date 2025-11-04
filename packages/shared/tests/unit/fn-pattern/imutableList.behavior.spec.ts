import { describe, expect, test } from "bun:test";
import { ImutableListFactory } from "@conecta/fn";

describe("ImutableListFactory behavior", () => {
  test("empty cria lista vazia imutável", () => {
    const list = ImutableListFactory.empty<number>();

    expect(list.isEmpty()).toBe(true);
    expect(list.count()).toBe(0);
  });

  test("add/remove produzem novas instâncias mantendo imutabilidade", () => {
    const original = ImutableListFactory.empty<string>();
    const withItem = original.add("item");
    const withoutItem = withItem.remove("item");

    expect(original.isEmpty()).toBe(true);
    expect(withItem.contains("item")).toBe(true);
    expect(withoutItem.contains("item")).toBe(false);
  });

  test("setUnique elimina duplicados e mantém ordem de inserção", () => {
    const list = ImutableListFactory.fromArray(["a", "b", "a"]);
    const uniqueList = list.setUnique();

    expect(uniqueList.getAll()).toEqual(["a", "b"]);
  });

  test("castTolist realiza cópia defensiva dos elementos", () => {
    const base = ImutableListFactory.fromArray([1, 2, 3]);
    const cloned = ImutableListFactory.castTolist(base);

    expect(cloned.getAll()).toEqual([1, 2, 3]);
    expect(cloned).not.toBe(base);
  });
});
