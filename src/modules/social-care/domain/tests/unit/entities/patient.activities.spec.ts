import { describe, expect, test } from "bun:test";
import { List } from "@conecta/fn";
import { Result } from "@conecta/result";
import {
	Diagnosis,
	ICDCode,
	Patient,
	PersonId,
	FamilyMember,
	FamilyMemberId,
	Timestamp,
} from "@conecta/social-care";
import { Uuid } from "@conecta/uuid";
import { belongsToBoundary } from "../../../entities/patient/activities";

const createPatient = () => {
	const personId = Result.unwrap(
		PersonId.create("018f4a7a-1e37-7b2c-8f00-123456789abc"),
	);
	const diagnosis = Result.unwrap(
		Diagnosis.create(
			{
				id: Result.unwrap(ICDCode.create("A00.0")),
				date: Result.unwrap(Timestamp.create({ value: new Date() })),
				description: "Diagnóstico inicial válido",
			},
			Result.unwrap(Timestamp.create({ value: new Date() })),
		),
	);
	return Result.unwrap(Patient.createFromScratch(personId, List.from([diagnosis])));
};

describe("PatientActivities.belongsToBoundary", () => {
	test("retorna true para personId do próprio paciente", () => {
		const patient = createPatient();
		const result = belongsToBoundary(
			Result.unwrap(Uuid.create(patient.props.personId.toString())),
			patient,
		);

		expect(result).toBe(true);
	});

	test("retorna false para id fora da fronteira do agregado", () => {
		const patient = createPatient();
		const outsider = Uuid.v7().uuid;
		const result = belongsToBoundary(outsider, patient);

		expect(result).toBe(false);
	});

	test("retorna true para personId de membro da família", () => {
		const patient = createPatient();
		const memberPersonId = Result.unwrap(
			PersonId.create("018f4a7a-1e37-7b2c-8f00-999999999999"),
		);
		const memberId = Result.unwrap(
			FamilyMemberId.create("018f4a7a-1e37-7b2c-8f00-444444444444"),
		);
		const familyMember = Result.unwrap(
			FamilyMember.create({
				id: memberId,
				personId: memberPersonId,
				relationship: "Sister",
				residesWithPatient: true,
				isPrimaryCaregiver: false,
			}),
		);
		const updated = Result.unwrap(
			Patient.addFamilyMember(patient, familyMember, new Date()),
		);

		const result = belongsToBoundary(
			Result.unwrap(Uuid.create(memberPersonId.toString())),
			updated,
		);

		expect(result).toBe(true);
	});
});
