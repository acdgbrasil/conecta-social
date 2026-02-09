import { describe, expect, test } from "bun:test";
import type { Branded, DeepReadonly } from "@conecta/fn";

describe("fp foundations types", () => {
  test("Branded impede atribuicao de tipo base", () => {
    type UserId = Branded<string, "UserId">;

    const branded = "user-1" as UserId;
    const raw: string = branded;

    expect(raw).toBe("user-1");

    // @ts-expect-error: string puro nao deve ser atribuivel a UserId
    const invalid: UserId = "user-2";
    void invalid;
  });

  test("DeepReadonly torna estruturas aninhadas imutaveis", () => {
    type Config = {
      nested: {
        value: number;
      };
      list: Array<{ name: string }>;
    };

    const readonlyConfig: DeepReadonly<Config> = {
      nested: { value: 1 },
      list: [{ name: "alpha" }],
    };

    expect(readonlyConfig.nested.value).toBe(1);
    expect(readonlyConfig.list[0].name).toBe("alpha");

    // @ts-expect-error: propriedades internas devem ser readonly
    readonlyConfig.nested.value = 2;

    // @ts-expect-error: arrays internos devem ser readonly
    readonlyConfig.list.push({ name: "beta" });
  });

  test("DeepReadonly deve preservar assinaturas de funcoes com argumentos", () => {
    type WithCallback = {
      callback: (id: string, count: number) => boolean;
    };

    const obj: DeepReadonly<WithCallback> = {
      callback: (id: string, count: number) => id.length > count
    };

    // Nao deve dar erro ao chamar a funcao
    const result = obj.callback("test", 2);
    expect(result).toBe(true);
  });
});
