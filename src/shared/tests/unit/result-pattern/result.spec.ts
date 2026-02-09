import { describe, expect, it } from "bun:test";
import { Result } from "@conecta/result";

describe("Result Pattern", () => {
  describe("Constructors", () => {
    it("ok cria sucesso", () => {
      const r = Result.ok(10);
      expect(Result.isOk(r)).toBe(true);
      expect(Result.unwrap(r)).toBe(10);
    });

    it("err cria erro", () => {
      const r = Result.err("falha");
      expect(Result.isErr(r)).toBe(true);
      expect(Result.unwrapErr(r)).toBe("falha");
    });

    it("safe captura exceção", () => {
      const r = Result.safe(() => {
        throw new Error("boom");
      });
      expect(Result.isErr(r)).toBe(true);
    });

    it("tryAsync captura rejeição de promise", async () => {
      const r = await Result.tryAsync(Promise.reject("boom"));
      expect(Result.isErr(r)).toBe(true);
    });

    it("fromCondition cria sucesso ou erro baseado em booleano", () => {
      expect(Result.isOk(Result.fromCondition(true, 1, "err"))).toBe(true);
      expect(Result.isErr(Result.fromCondition(false, 1, "err"))).toBe(true);
    });
  });

  describe("Transformations", () => {
    it("map transforma sucesso", () => {
      const r = Result.ok(2);
      const mapped = Result.map(r, (n) => n * 2);
      expect(Result.unwrap(mapped)).toBe(4);
    });

    it("mapErr transforma erro", () => {
      const r = Result.err(2);
      const mapped = Result.mapErr(r, (n) => `Erro ${n}`);
      expect(Result.unwrapErr(mapped)).toBe("Erro 2");
    });

    it("flatMap encadeia logica", () => {
      const r = Result.ok("10");
      const chain = Result.flatMap(r, (s) => Result.ok(parseInt(s)));
      expect(Result.unwrap(chain)).toBe(10);
    });
  });

  describe("Utilities", () => {
    it("all combina resultados com sucesso", () => {
      const list = [Result.ok(1), Result.ok(2)];
      const combined = Result.all(list);
      expect(Result.unwrap(combined)).toEqual([1, 2]);
    });

    it("all falha no primeiro erro", () => {
      const list = [Result.ok(1), Result.err("erro"), Result.ok(3)];
      const combined = Result.all(list);
      expect(Result.isErr(combined)).toBe(true);
      expect(Result.unwrapErr(combined)).toBe("erro");
    });

        it("match trata ambos os casos", () => {

          const r = Result.ok(1);

          const val = Result.match(r, {

            ok: (n) => n + 1,

            err: () => 0,

          });

          expect(val).toBe(2);

        });

    

        it("unwrapOr retorna fallback em caso de erro", () => {

          expect(Result.unwrapOr(Result.ok(1), 2)).toBe(1);

          expect(Result.unwrapOr(Result.err("err"), 2)).toBe(2);

        });

    

        it("unwrapOrElse executa função em caso de erro", () => {

          expect(Result.unwrapOrElse(Result.ok(1), () => 2)).toBe(1);

          expect(Result.unwrapOrElse(Result.err("err"), (e) => (e as string).length)).toBe(3);

        });

    

        it("promiseAll aguarda lista de promises", async () => {

          const promises = [

            Promise.resolve(Result.ok(1)),

            Promise.resolve(Result.ok(2))

          ];

          const result = await Result.promiseAll(promises);

          expect(Result.unwrap(result)).toEqual([1, 2]);

        });

    it("combine agrupa objeto de resultados", () => {
      const results = {
        id: Result.ok(1),
        name: Result.ok("test")
      };
      const combined = Result.combine(results);
      expect(Result.unwrap(combined)).toEqual({ id: 1, name: "test" });
    });

    it("combine falha se houver um erro no objeto", () => {
      const results = {
        id: Result.ok(1),
        name: Result.err("missing name")
      };
      const combined = Result.combine(results);
      expect(Result.isErr(combined)).toBe(true);
      expect(Result.unwrapErr(combined)).toBe("missing name");
    });

      });

    });

    