import { describe, expect, test } from "bun:test";
import { Timestamp } from "@conecta/social-care";

describe("Timestamp.valueObject (RED tests)", () => {
  test("aceita strings ISO convertendo automaticamente para Date", () => {
    const result = Timestamp.create({ value: "2024-05-10T03:00:00Z" as unknown as Date });

    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    expect(result.unwrap().toISOString()).toBe("2024-05-10T03:00:00.000Z");
  });

  test("trunca milissegundos ao normalizar datas", () => {
    const dateWithMs = new Date("2024-05-10T03:00:00.987Z");
    const result = Timestamp.create({ value: dateWithMs });

    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    expect(result.unwrap().toISOString()).toBe("2024-05-10T03:00:00.000Z");
  });
});
