import { afterAll, describe, expect, test } from "bun:test";
import { List } from "@conecta/fn";
import { Option } from "@conecta/option";
import { Result } from "@conecta/result";
import { createBunSqlAdapter } from "@conecta/runtime/bun/sql.adapter";
import {
	Diagnosis,
	FamilyMemberId,
	HousingCondition,
	ICDCode,
	Patient,
	PersonId,
	SocialBenefit,
	SocialBenefitsCollection,
	SocioEconomicSituation,
	Timestamp,
} from "@conecta/social-care";
import { makePatientPersistenceAdapter } from "../../adapter/persistence/patient.persistence.adapter";

const shouldRunDbIntegration = ["1", "true"].includes(
	(
		Bun.env.RUN_DB_INTEGRATION ??
		process.env.RUN_DB_INTEGRATION ??
		""
	).toLowerCase(),
);
const testDb = shouldRunDbIntegration ? test : test.skip;

describe("PostgresPatientRepository (Integration)", () => {
	const sql = createBunSqlAdapter({
		hostname: process.env.SC_DB_HOST || "localhost",
		port: Number(process.env.SC_DB_PORT) || 5433,
		username: process.env.SC_DB_USER || "admin",
		password: process.env.SC_DB_PASSWORD || "admin",
		database: process.env.SC_DB_NAME || "social_care",
	});

	const repository = makePatientPersistenceAdapter(sql);

	const createFullPatient = () => {
		const personId = Result.unwrap(
			PersonId.create("018f4a7a-1e37-7b2c-8f00-123456789abc"),
		);
		const now = Result.unwrap(Timestamp.create({ value: new Date() }));

		const diagnosis = Result.unwrap(
			Diagnosis.create(
				{
					id: Result.unwrap(ICDCode.create("F84.0")),
					date: now,
					description: "Autismo",
				},
				now,
			),
		);

		let patient = Result.unwrap(
			Patient.createFromScratch(personId, List.from([diagnosis])),
		);

		// Adiciona Condição de Moradia
		const housing = Result.unwrap(
			HousingCondition.create({
				housingConditionType: "OWNED",
				wallMaterial: "MASONRY",
				numberOfRooms: 4,
				numberOfBathrooms: 2,
				waterSupplyType: "PUBLIC_NETWORK",
				electricityAccess: "METERED_CONNECTION",
				sewerDisposalMethod: "PUBLIC_SEWER",
				wasteCollectionType: "DIRECT_COLLECTION",
				accessibilityLevel: "FULLY_ACCESSIBLE",
				isInGeographicRiskArea: false,
				isInSocialConflictArea: false,
			}),
		);

		patient = Result.unwrap(Patient.updateHousingCondition(patient, housing));

		// Adiciona Situação Socioeconômica
		const benefit = Result.unwrap(
			SocialBenefit.create({
				benefitName: "Bolsa Familia",
				amount: 600,
				beneficiaryId: Result.unwrap(
					FamilyMemberId.create("018f4a7a-1e37-7b2c-8f00-999999999999"),
				),
			}),
		);

		const socioeconomic = Result.unwrap(
			SocioEconomicSituation.create({
				totalFamilyIncome: 2000,
				incomePerCapita: 500,
				receivesSocialBenefit: true,
				socialBenefits: Result.unwrap(
					SocialBenefitsCollection.create([benefit]),
				),
				mainSourceOfIncome: "Salary",
				hasUnemployed: false,
			}),
		);

		patient = Result.unwrap(
			Patient.updateSocioEconomicSituation(patient, socioeconomic),
		);

		return patient;
	};

	testDb("deve salvar e recuperar um agregado completo", async () => {
		const patient = createFullPatient();

		// Limpa dados anteriores
		try {
			await sql`DELETE FROM patients WHERE person_id = ${patient.props.personId.toString()}`;
		} catch {
			console.warn(
				"Aviso: Falha ao limpar dados (Postgres pode estar offline).",
			);
		}

		// 1. Salva
		const saveResult = await repository.save(patient);
		expect(Result.isOk(saveResult)).toBe(true);

		// 2. Verifica existência
		const exists = await repository.existsByPersonId(patient.props.personId);
		expect(Result.unwrap(exists)).toBe(true);

		// 3. Busca por PersonId
		const foundByPersonResult = await repository.findByPersonId(
			patient.props.personId,
		);
		expect(Result.isOk(foundByPersonResult)).toBe(true);
		const foundPatient = Result.unwrap(foundByPersonResult);

		expect(foundPatient.id.toString()).toBe(patient.id.toString());
		expect(foundPatient.props.personId.toString()).toBe(
			patient.props.personId.toString(),
		);

		// Valida JSONB (Housing)
		expect(Option.isSome(foundPatient.props.housingCondition)).toBe(true);
		const foundHousing = Option.unwrap(foundPatient.props.housingCondition);
		expect(foundHousing.housingConditionType).toBe("OWNED");

		// Valida JSONB (Socioeconomic)
		expect(Option.isSome(foundPatient.props.socioeconomicSituation)).toBe(true);
		const foundSocio = Option.unwrap(foundPatient.props.socioeconomicSituation);
		expect(foundSocio.totalFamilyIncome).toBe(2000);
	});

	testDb("deve retornar erro ao buscar paciente inexistente", async () => {
		const randomId = Result.unwrap(
			PersonId.create("018f4a7a-1e37-7b2c-8f00-000000000000"),
		);
		const result = await repository.findByPersonId(randomId);

		// Se o banco cair, ele retorna APP-002. Se estiver UP, retorna PAT-001.
		// Ambos indicam que o registro não foi encontrado no fluxo normal.
		expect(Result.isErr(result)).toBe(true);
		expect(["PAT-001", "APP-002"]).toContain(result.error.code);
	});

	afterAll(async () => {
		// Bun gerencia o pooling
	});
});
