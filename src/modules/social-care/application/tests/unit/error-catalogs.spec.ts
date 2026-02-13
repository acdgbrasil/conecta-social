import { describe, expect, test } from "bun:test";
import {
	AppError,
	ApplicationError,
} from "@conecta/social-care/application/errors/application.error";
import {
	CmdError,
	CommandError,
} from "@conecta/social-care/application/errors/command.error";

describe("Application Error Catalogs", () => {
	test("AppError shortcuts expõem todos os códigos esperados", () => {
		expect(AppError.UseCaseNotImplemented().code).toBe("APP-001");
		expect(AppError.RepositoryNotAvailable().code).toBe("APP-002");
		expect(AppError.PersonIdAlreadyExists().code).toBe("APP-003");
		expect(AppError.FailToCastDignosisList().code).toBe("APP-004");
		expect(AppError.FailToCastPersonId().code).toBe("APP-005");

		const mapping = AppError.PersistenceMappingFailure("p-1", ["a", "b"], 2);
		expect(mapping.code).toBe("APP-006");
		expect(mapping.message).toContain("2 erro(s)");
		expect(mapping.context.patientId).toBe("p-1");
	});

	test("ApplicationError factory exporta helpers estruturais", () => {
		expect(ApplicationError.catalog.UseCaseNotImplemented.code).toBe("APP-001");
		expect(ApplicationError.bc).toBe("SOCIAL");
		expect(ApplicationError.module).toBe("social-care/application");
	});

	test("CmdError e CommandError cobrem entrada inválida", () => {
		const shortcut = CmdError.InvalidCommandInput("payload inválido");
		const direct = CommandError.InvalidCommandInput({
			details: "faltando campo obrigatório",
		});

		expect(shortcut.code).toBe("CMD-001");
		expect(direct.code).toBe("CMD-001");
		expect(shortcut.message).toContain("payload inválido");
		expect(direct.message).toContain("faltando campo obrigatório");
	});
});
