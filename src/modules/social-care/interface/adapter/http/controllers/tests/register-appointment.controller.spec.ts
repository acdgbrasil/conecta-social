import { beforeEach, describe, expect, mock, test } from "bun:test";
import { Result } from "@conecta/result";
import type { DomainError } from "@conecta/shared/erros-pattern/DomainError";
import { Hono } from "hono";
import { registerAppointmentController } from "../register-appointment.controller";

describe("RegisterAppointmentController (Hardening)", () => {
	const mockUseCase = {
		execute: mock(),
	};

	const app = new Hono();
	app.post(
		"/patients/:id/appointments",
		registerAppointmentController(mockUseCase as any),
	);

	beforeEach(() => {
		mockUseCase.execute.mockReset();
	});

	test("deve aguardar o parse do body JSON (prevenindo bug de await ausente)", async () => {
		const patientId = "018f4a7a-1e37-7b2c-8f00-123456789abc";
		const body = {
			professionalId: "018f4a7a-1e37-7b2c-8f00-888888888888",
			summary: "Atendimento de rotina",
		};

		mockUseCase.execute.mockResolvedValue(Result.ok({ id: "appointment-123" }));

		const res = await app.request(`/patients/${patientId}/appointments`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});

		expect(res.status).toBe(201);
		expect(mockUseCase.execute).toHaveBeenCalled();
	});

	test("deve usar o status HTTP definido no DomainError (error.http ?? 422)", async () => {
		const patientId = "018f4a7a-1e37-7b2c-8f00-123456789abc";
		const body = {
			professionalId: "018f4a7a-1e37-7b2c-8f00-888888888888",
			summary: "Test",
		};
		const customError: Partial<DomainError> = {
			message: "Paciente não encontrado",
			http: 404,
			code: "NOT_FOUND",
			context: { internal: "sensitive info" },
		};

		mockUseCase.execute.mockResolvedValue(Result.err(customError));

		const res = await app.request(`/patients/${patientId}/appointments`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});

		const responseBody = await res.json();

		expect(res.status).toBe(404);
		expect(responseBody.success).toBe(false);
		expect(responseBody.error).toBe("Paciente não encontrado");
		// Garante que não vazou o contexto interno ou outros campos do DomainError
		expect(responseBody.context).toBeUndefined();
	});

	test("deve retornar 422 como fallback se error.http não estiver definido", async () => {
		const patientId = "018f4a7a-1e37-7b2c-8f00-123456789abc";
		const body = {
			professionalId: "018f4a7a-1e37-7b2c-8f00-888888888888",
			summary: "Test",
		};
		const domainError: Partial<DomainError> = {
			message: "Violação de regra de negócio",
			code: "RULE_VIOLATION",
		};

		mockUseCase.execute.mockResolvedValue(Result.err(domainError));

		const res = await app.request(`/patients/${patientId}/appointments`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});

		expect(res.status).toBe(422);
	});
});
