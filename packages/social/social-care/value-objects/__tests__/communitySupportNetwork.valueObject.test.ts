import { describe, expect, test } from "bun:test";
import { CommunitySupportNetwork } from "../communitySupportNetwort.valueObject";

describe("CommunitySupportNetwork.valueObject", () => {
  test("cria rede de apoio comunitário com todos os dados informados", () => {
    const result = CommunitySupportNetwork.create(
      true,
      false,
      "Conflitos ocasionais com vizinhos",
      true,
      false,
      true,
      false,
    );

    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    const network = result.unwrap();
    expect(network.hasSupportFromRelatives).toBe(true);
    expect(network.hasSupportFromNeighbors).toBe(false);
    expect(network.familyConflicts).toBe("Conflitos ocasionais com vizinhos");
    expect(Object.isFrozen(network)).toBe(true);
  });
});
