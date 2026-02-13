import { describe, expect, test } from "bun:test";
import { List } from "@conecta/fn";
import type { SqlPort, SqlTransaction } from "@conecta/ports";
import { Result } from "@conecta/result";
import {
	Diagnosis,
	ICDCode,
	Patient,
	PersonId,
	Timestamp,
} from "@conecta/social-care";
import { Uuid } from "@conecta/uuid";
import { makePatientPersistenceAdapter } from "../../patient.persistence.adapter";

type Query = { sql: string; values: readonly unknown[] };

const buildSqlPort = (handler: (query: Query) => Promise<unknown>): SqlPort => {
	const sql = (async (
		strings: TemplateStringsArray,
		...values: unknown[]
	): Promise<unknown> => {
		return handler({ sql: strings.join("?"), values });
	}) as SqlPort;

	sql.begin = async <T>(fn: (tx: SqlTransaction) => Promise<T>) => {
		const tx = (async (
			strings: TemplateStringsArray,
			...values: unknown[]
		): Promise<unknown> => {
			return handler({ sql: strings.join("?"), values });
		}) as SqlTransaction;

		return fn(tx);
	};

	sql.close = async () => {};
	return sql;
};

const createPatient = (options: { withEvents: boolean }) => {
	const personId = Result.unwrap(
		PersonId.create("018f4a7a-1e37-7b2c-8f00-123456789abc"),
	);
	const diagnosis = Result.unwrap(
		Diagnosis.create(
			{
				id: Result.unwrap(ICDCode.create("A00.0")),
				date: Result.unwrap(Timestamp.create({ value: new Date() })),
				description: "Diagnóstico inicial",
			},
			Result.unwrap(Timestamp.create({ value: new Date() })),
		),
	);

	const patient = Result.unwrap(
		Patient.createFromScratch(personId, List.from([diagnosis])),
	);

	if (options.withEvents) return patient;
	return Patient.pullDomainEvents(patient).patient;
};

describe("PatientPersistenceAdapter (Unit)", () => {
	test("save persiste agregado sem outbox quando não há eventos pendentes", async () => {
		const queries: Query[] = [];
		const sql = buildSqlPort(async (query) => {
			queries.push(query);
			return [];
		});
		const repository = makePatientPersistenceAdapter(sql);
		const patient = createPatient({ withEvents: false });

		const result = await repository.save(patient);

		expect(Result.isOk(result)).toBe(true);
		expect(queries.length).toBe(1);
		expect(queries[0].sql).toContain("INSERT INTO patients");
	});

	test("save persiste eventos no outbox quando o agregado possui eventos", async () => {
		const queries: Query[] = [];
		const sql = buildSqlPort(async (query) => {
			queries.push(query);
			return [];
		});
		const repository = makePatientPersistenceAdapter(sql);
		const patient = createPatient({ withEvents: true });

		const result = await repository.save(patient);

		expect(Result.isOk(result)).toBe(true);
		expect(queries.some((q) => q.sql.includes("INSERT INTO patients"))).toBe(
			true,
		);
		expect(
			queries.some((q) => q.sql.includes("INSERT INTO outbox_events")),
		).toBe(true);
	});

	test("save retorna APP-002 quando a transação falha", async () => {
		const sql = buildSqlPort(async () => {
			throw new Error("db down");
		});
		const repository = makePatientPersistenceAdapter(sql);
		const patient = createPatient({ withEvents: false });

		const result = await repository.save(patient);

		expect(Result.isErr(result)).toBe(true);
		if (!Result.isErr(result)) return;
		expect(result.error.code).toBe("APP-002");
	});

	test("existsByPersonId retorna true/false conforme resultado da query", async () => {
		const personId = Result.unwrap(
			PersonId.create("018f4a7a-1e37-7b2c-8f00-123456789abc"),
		);
		const sql = buildSqlPort(async (query) => {
			if (query.sql.includes("SELECT 1 FROM patients")) {
				return [{ found: 1 }];
			}
			return [];
		});
		const repository = makePatientPersistenceAdapter(sql);

		const result = await repository.existsByPersonId(personId);

		expect(Result.isOk(result)).toBe(true);
		expect(Result.unwrap(result)).toBe(true);
	});

	test("existsByPersonId retorna APP-002 quando a consulta falha", async () => {
		const personId = Result.unwrap(
			PersonId.create("018f4a7a-1e37-7b2c-8f00-123456789abc"),
		);
		const sql = buildSqlPort(async () => {
			throw new Error("db unavailable");
		});
		const repository = makePatientPersistenceAdapter(sql);

		const result = await repository.existsByPersonId(personId);

		expect(Result.isErr(result)).toBe(true);
		if (!Result.isErr(result)) return;
		expect(result.error.code).toBe("APP-002");
	});

	test("findByPersonId retorna erro de paciente não encontrado", async () => {
		const personId = Result.unwrap(
			PersonId.create("018f4a7a-1e37-7b2c-8f00-123456789abc"),
		);
		const sql = buildSqlPort(async () => []);
		const repository = makePatientPersistenceAdapter(sql);

		const result = await repository.findByPersonId(personId);

		expect(Result.isErr(result)).toBe(true);
		if (!Result.isErr(result)) return;
		expect(result.error.code).toBe("PAT-011");
	});

	test("findByPersonId e findById mapeiam row válida para domínio", async () => {
		const row = {
			id: "018f4a7a-1e37-7b2c-8f00-123456789abc",
			person_id: "018f4a7a-1e37-7b2c-8f00-999999999999",
			housing_condition: null,
			socioeconomic_situation: null,
			community_support_network: null,
			social_health_summary: null,
			version: 2,
		};
		const sql = buildSqlPort(async () => [row]);
		const repository = makePatientPersistenceAdapter(sql);
		const personId = Result.unwrap(PersonId.create(row.person_id));
		const uuid = Result.unwrap(Uuid.create(row.id));

		const byPerson = await repository.findByPersonId(personId);
		const byId = await repository.findById(uuid);

		expect(Result.isOk(byPerson)).toBe(true);
		expect(Result.isOk(byId)).toBe(true);
	});

	test("findById retorna erro de paciente não encontrado", async () => {
		const sql = buildSqlPort(async () => []);
		const repository = makePatientPersistenceAdapter(sql);
		const uuid = Result.unwrap(
			Uuid.create("018f4a7a-1e37-7b2c-8f00-111111111111"),
		);

		const result = await repository.findById(uuid);

		expect(Result.isErr(result)).toBe(true);
		if (!Result.isErr(result)) return;
		expect(result.error.code).toBe("PAT-011");
	});

	test("findByPersonId e findById retornam APP-002 quando a consulta falha", async () => {
		const personId = Result.unwrap(
			PersonId.create("018f4a7a-1e37-7b2c-8f00-222222222222"),
		);
		const uuid = Result.unwrap(
			Uuid.create("018f4a7a-1e37-7b2c-8f00-333333333333"),
		);
		const sql = buildSqlPort(async () => {
			throw new Error("query failed");
		});
		const repository = makePatientPersistenceAdapter(sql);

		const byPerson = await repository.findByPersonId(personId);
		const byId = await repository.findById(uuid);

		expect(Result.isErr(byPerson)).toBe(true);
		expect(Result.isErr(byId)).toBe(true);
		if (Result.isErr(byPerson)) expect(byPerson.error.code).toBe("APP-002");
		if (Result.isErr(byId)) expect(byId.error.code).toBe("APP-002");
	});
});
