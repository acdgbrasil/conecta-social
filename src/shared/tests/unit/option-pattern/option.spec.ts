import { describe, expect, it } from "bun:test";
import { Option } from "@conecta/option";

describe("Option Pattern", () => {
  describe("Constructors", () => {
    it("none cria um Option vazio", () => {
      const opt = Option.none();
      expect(Option.isNone(opt)).toBe(true);
      expect(Option.isSome(opt)).toBe(false);
      expect(() => Option.unwrap(opt)).toThrow();
    });

    it("isSome e isNone funcionam como type guards", () => {
      const some = Option.some(1);
      const none = Option.none();
      
      expect(Option.isSome(some)).toBe(true);
      expect(Option.isNone(some)).toBe(false);
      expect(Option.isSome(none)).toBe(false);
      expect(Option.isNone(none)).toBe(true);
    });

    it("some cria um Option com valor", () => {
      const opt = Option.some(10);
      expect(Option.isSome(opt)).toBe(true);
      expect(Option.isNone(opt)).toBe(false);
      expect(Option.unwrap(opt)).toBe(10);
    });

    it("fromNullable lida com null/undefined", () => {
      expect(Option.isNone(Option.fromNullable(null))).toBe(true);
      expect(Option.isNone(Option.fromNullable(undefined))).toBe(true);
      expect(Option.isSome(Option.fromNullable(0))).toBe(true);
    });

    it("fromPredicate cria Some se o predicado for verdadeiro", () => {
      expect(Option.isSome(Option.fromPredicate(10, (n) => n > 5))).toBe(true);
      expect(Option.isNone(Option.fromPredicate(10, (n) => n < 5))).toBe(true);
    });

    it("safe captura exceções", () => {
      const success = Option.safe(() => JSON.parse('{"a":1}'));
      const failure = Option.safe(() => JSON.parse("invalid"));

      expect(Option.isSome(success)).toBe(true);
      expect(Option.isNone(failure)).toBe(true);
    });
  });

  describe("Transformations", () => {
    it("map transforma o valor", () => {
      const opt = Option.some(2);
      const mapped = Option.map(opt, (n) => n * 2);
      expect(Option.unwrap(mapped)).toBe(4);
    });

    it("flatMap encadeia Options", () => {
      const opt = Option.some("10");
      const result = Option.flatMap(opt, (s) => {
        const n = parseInt(s);
        return isNaN(n) ? Option.none() : Option.some(n);
      });
      expect(Option.unwrap(result)).toBe(10);
    });

    it("filter retém valores que passam no predicado", () => {
      const opt = Option.some(10);
      expect(Option.isSome(Option.filter(opt, (n) => n > 5))).toBe(true);
      expect(Option.isNone(Option.filter(opt, (n) => n > 15))).toBe(true);
    });
  });

  describe("Utilities", () => {
    it("unwrapOr retorna fallback", () => {
      const none = Option.none();
      expect(Option.unwrapOr(none, 5)).toBe(5);
    });

    it("unwrapOrElse retorna fallback lazy", () => {
      const none = Option.none();
      expect(Option.unwrapOrElse(none, () => 10)).toBe(10);
      expect(Option.unwrapOrElse(Option.some(5), () => 10)).toBe(5);
    });

    it("zip combina dois valores", () => {
      const a = Option.some(1);
      const b = Option.some(2);
      const c = Option.none();

      expect(Option.unwrap(Option.zip(a, b))).toEqual([1, 2]);
      expect(Option.isNone(Option.zip(a, c))).toBe(true);
      expect(Option.isNone(Option.zip(c, a))).toBe(true);
    });

    it("all combina lista de options", () => {
      const list = [Option.some(1), Option.some(2)];
      expect(Option.unwrap(Option.all(list))).toEqual([1, 2]);

      const listWithNone = [Option.some(1), Option.none()];
      expect(Option.isNone(Option.all(listWithNone))).toBe(true);
    });
  });
});
