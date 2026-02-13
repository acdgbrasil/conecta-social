import type { UseCasePort } from "@conecta/ports";
import { Result } from "@conecta/result";
import type { DomainError } from "@conecta/shared/erros-pattern/DomainError";
import type { RegisterAppointmentCommand } from "@conecta/social-care/application/ports/commands/register-appointment.command";
import type { Context } from "hono";
import { createRegisterAppointmentCommand } from "../../commands/register-appointment.command.adapter";

export const registerAppointmentController =
	(
		useCase: UseCasePort<
			RegisterAppointmentCommand,
			Result<unknown, DomainError>
		>,
	) =>
	async (c: Context) => {
		try {
			const patientId = c.req.param("id");
			let body: unknown;
			try {
				// Tenta aproveitar o body já validado pelo middleware de rota (quando existir).
				// @ts-expect-error - inferência de tipo do Hono para valid("json")
				const validatedBody = c.req.valid?.("json");
				body = validatedBody ?? (await c.req.json());
			} catch {
				return c.json({ success: false, error: "Invalid JSON body" }, 400);
			}

			const commandResult = createRegisterAppointmentCommand({
				...body,
				patientId,
			});

			if (Result.isErr(commandResult)) {
				return c.json(
					{ success: false, error: commandResult.error.message },
					400,
				);
			}

			const result = await useCase.execute(commandResult.value);

			if (Result.isErr(result)) {
				const error = result.error;
				const status = error.http ?? 422;
				return c.json(
					{ success: false, error: error.message },
					status as never,
				);
			}

			return c.json({ success: true, data: result.value }, 201);
		} catch (error) {
			console.error("[registerAppointmentController] Crash:", error);
			return c.json({ success: false, error: "Internal Server Error" }, 500);
		}
	};
