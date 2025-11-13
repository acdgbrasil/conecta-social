import { describe, expect, test } from "bun:test";
import { ImutableListFactory } from "@conecta/fn";

describe("ImutableListFactory behavior", () => {
  const makeCircularNode = (value: number) => {
    const node: { value: number; self?: unknown } = { value };
    node.self = node;
    return node;
  };

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

  test("setUnique elimina duplicados e mantém ordem original", () => {
    const list = ImutableListFactory.fromArray(["a", "a", "b"]);

    const unique = list.setUnique();

    expect(unique.count()).toBe(2);
    expect(unique.getAll()).toEqual(["a", "b"]);
  });

  test("remove remove o elemento alvo e não reaproveita referência", () => {
    const list = ImutableListFactory.fromArray(["x"]);

    const updated = list.remove("x");

    expect(updated.contains("x")).toBe(false);
    expect(updated.count()).toBe(0);
    expect(updated).not.toBe(list);
  });

  test("hasDuplicates detecta duplicatas mesmo com estruturas circulares", () => {
    const list = ImutableListFactory.fromArray([
      makeCircularNode(1),
      makeCircularNode(1),
    ]);

    expect(() => list.hasDuplicates()).not.toThrow();
    expect(list.hasDuplicates()).toBe(true);
  });

  test("setUnique remove duplicatas sem mutar lista original", () => {
    const original = ImutableListFactory.fromArray([1, 1, 2]);

    const unique = original.setUnique();

    expect(unique.getAll()).toEqual([1, 2]);
    expect(original.getAll()).toEqual([1, 1, 2]);
  });

  test("hasDuplicates retorna false quando todos elementos são únicos", () => {
    const list = ImutableListFactory.fromArray([{ id: 1 }, { id: 2 }]);

    expect(list.hasDuplicates()).toBe(false);
  });
});
