import { describe, expect, test } from "bun:test";
import * as Conecta from "../../../index";

const shouldRunNonUnit = ["1", "true"].includes(
	(Bun.env.RUN_NON_UNIT ?? process.env.RUN_NON_UNIT ?? "").toLowerCase(),
);
const describeNonUnit = shouldRunNonUnit ? describe : describe.skip;

describeNonUnit("Public API Smoke Test", () => {
	test("deve exportar símbolos fundamentais do shared", () => {
		expect(Conecta.Result).toBeDefined();
		expect(Conecta.Option).toBeDefined();
		expect(Conecta.List).toBeDefined();
		expect(Conecta.pipe).toBeDefined();
		expect(Conecta.DomainError).toBeDefined();
		expect(Conecta.Uuid).toBeDefined();
	});

	test("deve exportar entidades do domínio social-care", () => {
		expect(Conecta.Patient).toBeDefined();
		expect(Conecta.Referral).toBeDefined();
		expect(Conecta.SocialCareAppointment).toBeDefined();
		expect(Conecta.FamilyMember).toBeDefined();
	});

	test("deve exportar Value Objects do domínio", () => {
		expect(Conecta.PersonId).toBeDefined();
		expect(Conecta.ICDCode).toBeDefined();
		expect(Conecta.Timestamp).toBeDefined();
		expect(Conecta.HousingCondition).toBeDefined();
	});

	test("deve exportar catálogos de erro", () => {
		expect(Conecta.RE).toBeDefined();
		expect(Conecta.PID).toBeDefined();
		expect(Conecta.TE).toBeDefined();
		expect(Conecta.SCAE).toBeDefined();
	});
});
