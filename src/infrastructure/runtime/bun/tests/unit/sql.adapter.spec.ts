import { beforeEach, describe, expect, test } from "bun:test";
import { BunSqlAdapter, createBunSqlAdapter } from "../../sql.adapter";

type SqlCall = { sql: string; values: unknown[] };
type SqlInstance = {
	config: unknown;
	calls: SqlCall[];
	txCalls: SqlCall[];
	closed: boolean;
};

const instances: SqlInstance[] = [];

const createSqlCtorDouble = () =>
	(function SQLDouble(this: unknown, config: unknown) {
		const state: SqlInstance = {
			config,
			calls: [],
			txCalls: [],
			closed: false,
		};

		const fn = (async (
			strings: TemplateStringsArray,
			...values: unknown[]
		): Promise<SqlCall> => {
			const call = { sql: strings.join("?"), values };
			state.calls.push(call);
			return call;
		}) as any;

		fn.begin = async (cb: (tx: any) => Promise<unknown>) => {
			const tx = (async (
				strings: TemplateStringsArray,
				...values: unknown[]
			): Promise<SqlCall> => {
				const call = { sql: strings.join("?"), values };
				state.txCalls.push(call);
				return call;
			}) as any;
			return cb(tx);
		};

		fn.close = async () => {
			state.closed = true;
		};

		instances.push(state);
		return fn;
	}) as any;

describe("sql.adapter", () => {
	beforeEach(() => {
		instances.length = 0;
	});

	test("BunSqlAdapter cobre constructor, toPrimitive e query", async () => {
		const adapter = new BunSqlAdapter(
			{ host: "db", port: 5432 },
			createSqlCtorDouble(),
		);
		const primitive = await adapter[Symbol.toPrimitive]?.("string");
		const result = await adapter.query(["SELECT ", ""] as any, 1);

		expect(primitive).toBeDefined();
		expect(result).toEqual({ sql: "SELECT ?", values: [1] });
		expect(instances[0]?.config).toEqual({ host: "db", port: 5432 });
		expect(instances[0]?.calls.length).toBe(1);
	});

	test("createBunSqlAdapter cobre query, begin e close", async () => {
		const adapter = createBunSqlAdapter(
			{ connectionString: "postgres://x" },
			createSqlCtorDouble(),
		);

		const queryResult = await adapter(["SELECT ", ""] as any, 2);
		const beginResult = await adapter.begin(async (tx) => {
			return tx(["INSERT INTO t VALUES(", ")"] as any, 10);
		});
		await adapter.close();

		expect(queryResult).toEqual({ sql: "SELECT ?", values: [2] });
		expect(beginResult).toEqual({
			sql: "INSERT INTO t VALUES(?)",
			values: [10],
		});
		expect(instances[0]?.calls.length).toBe(1);
		expect(instances[0]?.txCalls.length).toBe(1);
		expect(instances[0]?.closed).toBe(true);
	});
});
