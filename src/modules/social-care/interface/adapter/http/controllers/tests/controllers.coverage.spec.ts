import { describe, expect, mock, test } from "bun:test";
import { Result } from "@conecta/result";
import { addFamilyMemberController } from "../add-family-member.controller";
import { createReferralController } from "../create-referral.controller";
import { registerAppointmentController } from "../register-appointment.controller";
import { registerPatientController } from "../register-patient.controller";
import { removeFamilyMemberController } from "../remove-family-member.controller";
import { reportRightsViolationController } from "../report-rights-violation.controller";
import { updateHousingConditionController } from "../update-housing-condition.controller";
import { updateSocioEconomicSituationController } from "../update-socioeconomic-situation.controller";

const PATIENT_ID = "018f4a7a-1e37-7b2c-8f00-123456789abc";

type ContextOptions = {
	params?: Record<string, string>;
	jsonValue?: unknown;
	jsonThrows?: boolean;
	validValue?: unknown;
};

const createContext = (options: ContextOptions = {}) => {
	const json = mock((payload: unknown, status: number) => ({ payload, status }));
	const header = mock((_name: string, _value: string) => undefined);
	const req: Record<string, unknown> = {
		param: (name: string) => options.params?.[name] ?? "",
	};

	if (options.validValue !== undefined) {
		req.valid = (_type: string) => options.validValue;
	}

	req.json = async () => {
		if (options.jsonThrows) {
			throw new Error("invalid json");
		}
		return options.jsonValue ?? {};
	};

	return { req, json, header } as any;
};

describe("HTTP Controllers coverage branches", () => {
	test("addFamilyMemberController cai em command error com JSON inválido", async () => {
		const useCase = { execute: mock(async () => Result.ok({})) };
		const ctx = createContext({
			params: { id: PATIENT_ID },
			jsonThrows: true,
		});

		await addFamilyMemberController(useCase as any)(ctx);

		expect(useCase.execute).toHaveBeenCalledTimes(0);
		expect(ctx.json.mock.calls[0]?.[1]).toBe(400);
	});

	test("createReferralController cai em command error com JSON inválido", async () => {
		const useCase = { execute: mock(async () => Result.ok({})) };
		const ctx = createContext({
			params: { id: PATIENT_ID },
			jsonThrows: true,
		});

		await createReferralController(useCase as any)(ctx);

		expect(useCase.execute).toHaveBeenCalledTimes(0);
		expect(ctx.json.mock.calls[0]?.[1]).toBe(400);
	});

	test("updateHousingConditionController cai em command error com JSON inválido", async () => {
		const useCase = { execute: mock(async () => Result.ok({})) };
		const ctx = createContext({
			params: { id: PATIENT_ID },
			jsonThrows: true,
		});

		await updateHousingConditionController(useCase as any)(ctx);

		expect(useCase.execute).toHaveBeenCalledTimes(0);
		expect(ctx.json.mock.calls[0]?.[1]).toBe(400);
	});

	test("updateSocioEconomicSituationController cai em command error com JSON inválido", async () => {
		const useCase = { execute: mock(async () => Result.ok({})) };
		const ctx = createContext({
			params: { id: PATIENT_ID },
			jsonThrows: true,
		});

		await updateSocioEconomicSituationController(useCase as any)(ctx);

		expect(useCase.execute).toHaveBeenCalledTimes(0);
		expect(ctx.json.mock.calls[0]?.[1]).toBe(400);
	});

	test("reportRightsViolationController retorna details em command error", async () => {
		const useCase = { execute: mock(async () => Result.ok({})) };
		const ctx = createContext({
			params: { id: PATIENT_ID },
			jsonThrows: true,
		});

		await reportRightsViolationController(useCase as any)(ctx);

		expect(useCase.execute).toHaveBeenCalledTimes(0);
		expect(ctx.json.mock.calls[0]?.[1]).toBe(400);
		expect(ctx.json.mock.calls[0]?.[0]?.details).toBeDefined();
	});

	test("registerAppointmentController retorna 400 para JSON inválido", async () => {
		const useCase = { execute: mock(async () => Result.ok({})) };
		const ctx = createContext({
			params: { id: PATIENT_ID },
			jsonThrows: true,
		});

		await registerAppointmentController(useCase as any)(ctx);

		expect(useCase.execute).toHaveBeenCalledTimes(0);
		expect(ctx.json.mock.calls[0]?.[1]).toBe(400);
		expect(ctx.json.mock.calls[0]?.[0]?.error).toBe("Invalid JSON body");
	});

	test("registerAppointmentController retorna 400 para command inválido", async () => {
		const useCase = { execute: mock(async () => Result.ok({})) };
		const ctx = createContext({
			params: { id: PATIENT_ID },
			validValue: {},
		});

		await registerAppointmentController(useCase as any)(ctx);

		expect(useCase.execute).toHaveBeenCalledTimes(0);
		expect(ctx.json.mock.calls[0]?.[1]).toBe(400);
	});

	test("registerPatientController retorna 400 no command error com details", async () => {
		const useCase = { execute: mock(async () => Result.ok({})) };
		const ctx = createContext({
			validValue: {
				personId: "invalid",
				initialDiagnoses: [],
			},
		});

		await registerPatientController(useCase as any)(ctx);

		expect(useCase.execute).toHaveBeenCalledTimes(0);
		expect(ctx.json.mock.calls[0]?.[1]).toBe(400);
		expect(ctx.json.mock.calls[0]?.[0]?.details).toBeDefined();
	});

	test("removeFamilyMemberController retorna 400 quando params são inválidos", async () => {
		const useCase = { execute: mock(async () => Result.ok({})) };
		const ctx = createContext({
			params: { id: "invalid-id", memberId: "invalid-member-id" },
		});

		await removeFamilyMemberController(useCase as any)(ctx);

		expect(useCase.execute).toHaveBeenCalledTimes(0);
		expect(ctx.json.mock.calls[0]?.[1]).toBe(400);
	});
});
