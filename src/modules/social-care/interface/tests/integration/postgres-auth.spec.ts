import { SQL } from "bun";
import { describe, expect, test } from "bun:test";

const config = {
  hostname: process.env.SC_DB_HOST ?? "127.0.0.1",
  port: Number(process.env.SC_DB_PORT ?? "5433"),
  username: process.env.SC_DB_USER ?? "admin",
  password: process.env.SC_DB_PASSWORD ?? "admin",
  database: process.env.SC_DB_NAME ?? "social_care",
} as const;

describe("Infra Integration: Postgres auth", () => {
  test("deve autenticar e executar SELECT 1", async () => {
    const sql = new SQL({
      hostname: config.hostname,
      port: config.port,
      username: config.username,
      password: config.password,
      database: config.database,
      max: 1,
      idleTimeout: 1,
    });

    try {
      const rows = await sql<
        Array<{ ok: number; current_user: string; current_database: string }>
      >`SELECT 1 AS ok, current_user, current_database();`;

      expect(rows[0]?.ok).toBe(1);
      expect(rows[0]?.current_user).toBe(config.username);
      expect(rows[0]?.current_database).toBe(config.database);
    } finally {
      await sql.close();
    }
  });
});
