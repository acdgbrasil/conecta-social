import { describe, expect, test } from "bun:test";
import { PersonId, PID } from "@conecta/social-care";

const UPPERCASE_PERSON_ID = "01890E18-257B-7B32-B264-93C9D46242AB";
const LOWERCASE_PERSON_ID = UPPERCASE_PERSON_ID.toLowerCase();

describe("PersonId.valueObject (RED tests)", () => {
  test("aceita valores com espaços extras aplicando trim automaticamente", () => {
    const result = PersonId.create(`  ${UPPERCASE_PERSON_ID}  `);

    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    expect(result.unwrap().toString()).toBe(LOWERCASE_PERSON_ID);
  });

  test("trata ids iguais com caixa diferente como equivalentes", () => {
    const upper = PersonId.create(UPPERCASE_PERSON_ID);
    const lower = PersonId.create(LOWERCASE_PERSON_ID);

    expect(upper.isOk && lower.isOk).toBe(true);
    if (!upper.isOk || !lower.isOk) return;

    expect(upper.unwrap().equals(lower.unwrap())).toBe(true);
  });

  test("falha ao criar com formato de UUID inválido", () => {
    const invalidValue = "12345";
    const result = PersonId.create(invalidValue);

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.unwrapErr().code).toBe(PID.InvalidFormat(invalidValue).code); // "PID-001"
    expect(result.unwrapErr().message).toContain(invalidValue);
  });
});
