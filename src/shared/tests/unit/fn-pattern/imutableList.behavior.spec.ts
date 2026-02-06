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

    expect(ImutableListFactory.isEmpty(list)).toBe(true);
    expect(ImutableListFactory.count(list)).toBe(0);
  });

  test("add/remove produzem novas instâncias mantendo imutabilidade", () => {
    const original = ImutableListFactory.empty<string>();
    const withItem = ImutableListFactory.add(original, "item");
    const withoutItem = ImutableListFactory.remove(withItem, "item");

    expect(ImutableListFactory.isEmpty(original)).toBe(true);
    expect(ImutableListFactory.contains(withItem, "item")).toBe(true);
    expect(ImutableListFactory.contains(withoutItem, "item")).toBe(false);
  });

  test("setUnique elimina duplicados e mantém ordem de inserção", () => {
    const list = ImutableListFactory.fromArray(["a", "b", "a"]);
    const uniqueList = ImutableListFactory.setUnique(list);

    expect(ImutableListFactory.getAll(uniqueList)).toEqual(["a", "b"]);
  });

  test("castTolist realiza cópia defensiva dos elementos", () => {
    const base = ImutableListFactory.fromArray([1, 2, 3]);
    const cloned = ImutableListFactory.castTolist(base);

    expect(ImutableListFactory.getAll(cloned)).toEqual([1, 2, 3]);
    expect(cloned).not.toBe(base);
  });

  test("setUnique elimina duplicados e mantém ordem original", () => {
    const list = ImutableListFactory.fromArray(["a", "a", "b"]);

    const unique = ImutableListFactory.setUnique(list);

    expect(ImutableListFactory.count(unique)).toBe(2);
    expect(ImutableListFactory.getAll(unique)).toEqual(["a", "b"]);
  });

  test("remove remove o elemento alvo e não reaproveita referência", () => {
    const list = ImutableListFactory.fromArray(["x"]);

    const updated = ImutableListFactory.remove(list, "x");

    expect(ImutableListFactory.contains(updated, "x")).toBe(false);
    expect(ImutableListFactory.count(updated)).toBe(0);
    expect(updated).not.toBe(list);
  });

  test("hasDuplicates detecta duplicatas mesmo com estruturas circulares", () => {
    const list = ImutableListFactory.fromArray([
      makeCircularNode(1),
      makeCircularNode(1),
    ]);

    expect(() => ImutableListFactory.hasDuplicates(list)).not.toThrow();
    expect(ImutableListFactory.hasDuplicates(list)).toBe(true);
  });

  test("setUnique remove duplicatas sem mutar lista original", () => {
    const original = ImutableListFactory.fromArray([1, 1, 2]);

    const unique = ImutableListFactory.setUnique(original);

    expect(ImutableListFactory.getAll(unique)).toEqual([1, 2]);
    expect(ImutableListFactory.getAll(original)).toEqual([1, 1, 2]);
  });

  test("hasDuplicates retorna false quando todos elementos são únicos", () => {
    const list = ImutableListFactory.fromArray([{ id: 1 }, { id: 2 }]);

    expect(ImutableListFactory.hasDuplicates(list)).toBe(false);
  });
});
