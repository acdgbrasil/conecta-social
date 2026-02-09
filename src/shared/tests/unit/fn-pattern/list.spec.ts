import { describe, expect, it } from "bun:test";
import { List } from "@conecta/fn";

describe("ImutableList (Functional Namespace)", () => {
  describe("Constructors", () => {
    it("empty() cria lista vazia", () => {
      const l = List.empty();
      expect(l).toEqual([]);
      expect(List.isEmpty(l)).toBe(true);
    });

    it("of() cria lista a partir de argumentos", () => {
      const l = List.of(1, 2, 3);
      expect(l).toEqual([1, 2, 3]);
    });

    it("from() cria lista a partir de iterável", () => {
      const set = new Set(["a", "b"]);
      const l = List.from(set);
      expect(l).toEqual(["a", "b"]);
    });
  });

  describe("Operations", () => {
    it("add() cria nova lista e não muta original", () => {
      const original = List.of(1);
      const modified = List.add(original, 2);

      expect(original).toEqual([1]);
      expect(modified).toEqual([1, 2]);
      expect(original).not.toBe(modified);
    });

    it("remove() remove elemento por igualdade referencial", () => {
      const l = List.of(1, 2, 3, 2);
      const result = List.remove(l, 2);
      expect(result).toEqual([1, 3]);
    });

    it("map() transforma elementos", () => {
      const l = List.of(1, 2);
      const result = List.map(l, (n) => n * 2);
      expect(result).toEqual([2, 4]);
    });

    it("filter() filtra elementos", () => {
      const l = List.of(1, 2, 3, 4);
      const result = List.filter(l, (n) => n % 2 === 0);
      expect(result).toEqual([2, 4]);
    });

    it("toArray() converte para array mutável", () => {
      const l = List.of(1, 2);
      const arr = List.toArray(l);
      expect(Array.isArray(arr)).toBe(true);
      expect(arr).toEqual([1, 2]);
      expect(arr).not.toBe(l); // Cópia
    });

    it("isEmpty() verifica se está vazia", () => {
      expect(List.isEmpty(List.empty())).toBe(true);
      expect(List.isEmpty(List.of(1))).toBe(false);
    });

    it("count() retorna o tamanho da lista", () => {
      expect(List.count(List.of(1, 2, 3))).toBe(3);
    });

    it("has() verifica presença de elemento", () => {
      expect(List.has(List.of(1, 2), 1)).toBe(true);
      expect(List.has(List.of(1, 2), 3)).toBe(false);
    });
  });

  describe("Set Logic (Unique & Duplicates)", () => {
    it("unique() remove duplicatas primitivas", () => {
      const l = List.of(1, 2, 2, 3);
      expect(List.unique(l)).toEqual([1, 2, 3]);
    });

    it("unique() usa keySelector para objetos complexos", () => {
      const l = List.of(
        { id: 1, val: "a" },
        { id: 2, val: "b" },
        { id: 1, val: "c" } // ID duplicado
      );

      const result = List.unique(l, (item) => item.id);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it("hasDuplicates() detecta duplicatas primitivas", () => {
      expect(List.hasDuplicates(List.of(1, 2, 1))).toBe(true);
      expect(List.hasDuplicates(List.of(1, 2, 3))).toBe(false);
    });

    it("hasDuplicates() usa keySelector corretamente", () => {
      const l = List.of({ id: 1 }, { id: 1 });
      
      // Sem seletor (referência diferente)
      expect(List.hasDuplicates(l)).toBe(false);
      
      // Com seletor
      expect(List.hasDuplicates(l, (i) => i.id)).toBe(true);
    });
  });
});