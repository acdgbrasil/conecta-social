import { describe, expect, test } from "bun:test";
import { CommunitySupportNetwork } from "../communitySupportNetwort.valueObject";

describe("CommunitySupportNetwork.valueObject", () => {
  test("cria rede de apoio comunitário com todos os dados informados", () => {
    const props = {
      hasSupportFromRelatives: true,
      hasSupportFromNeighbors: false,
      familyConflicts: "Conflitos sobre finanças.",
      patientParticipatesInGroups: true,
      familyParticipatesInGroups: false,
      patientHasAccessToLeisure: true,
      facesDiscriminationInCommunity: false,
    };
    const result = CommunitySupportNetwork.create(props);

    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    const network = result.unwrap();
    expect(network.hasSupportFromRelatives).toBe(true);
    expect(network.familyConflicts).toBe("Conflitos sobre finanças.");
    expect(Object.isFrozen(network)).toBe(true);
  });
});
