import { Result } from "@conecta/result";
import { UseCasePipeline } from "@conecta/fn";
import { Option } from "@conecta/option";
import { Uuid } from "@conecta/uuid";
import { Person } from "../../domain/entities/person";
import type { PersonRepositoryPort } from "../../domain/repository/person.repository.port";
import type { RegisterPersonFromLogtoCommand } from "../ports/commands/register-person-from-logto.command";
import type { DomainError } from "@conecta/domain-error/DomainError";

export type RegisterPersonDeps = {
  readonly repository: PersonRepositoryPort;
  readonly logtoManagement: {
    readonly updateUserCustomData: (userId: string, customData: Record<string, unknown>) => Promise<Result<boolean, Error>>;
  };
};

export const makeRegisterPersonFromLogtoUseCase = (deps: RegisterPersonDeps) =>
  UseCasePipeline.build({
    parse: (command: Readonly<RegisterPersonFromLogtoCommand>) => {
      // Validação básica do comando
      if (!command.logtoUserId || !command.email) {
        return Result.err({ 
          message: "Logto User ID and Email are required", 
          code: "PEOPLE-001" 
        } as DomainError);
      }
      return Result.ok(command);
    },

    handle: async function* (ctx) {
      // 1. Cria a entidade Person no domínio
      const personId = Uuid.v7();
      
      const newPerson = Person.create(personId, {
        legalName: ctx.name ?? "Novo Usuário",
        socialName: Option.none(),
        birthDate: new Date(0), // Placeholder (deve ser atualizado via profile)
        taxId: `PENDENTE_${personId.toString()}`, // Placeholder até onboarding
        email: ctx.email,
        roles: ["VISITOR"], // Papel default inicial
        logtoUserId: Option.some(ctx.logtoUserId),
      });

      // 2. Sincroniza com Logto via Management API
      // Fazemos isso dentro do handle para garantir que se o Logto falhar, a transação não completa
      const syncResult = await deps.logtoManagement.updateUserCustomData(ctx.logtoUserId, {
        personId: personId.toString(),
      });

      if (Result.isErr(syncResult)) {
        return Result.err({
          message: `Failed to sync with Logto: ${syncResult.error.message}`,
          code: "PEOPLE-002"
        } as DomainError);
      }

      return Result.ok({ 
        aggregate: newPerson, 
        result: { personId: personId.toString() } 
      });
    },

    repository: deps.repository,
  });
