import { beforeEach, describe, expect, test } from "bun:test";
import { inMemoryEventBus } from "@conecta/adapters";
import { SQL } from "bun";
import {
  type RegisterNewPatientInput,
  RegisterNewPatientUseCase,
} from "packages/conecta-raros/social-care/application/use-cases/register-patient.use-case";
import { PatientSQLiteRepository } from "packages/conecta-raros/social-care/infrastructure/database/memory/SQLite/patient.sqlite.repository";

// Repositório com implementação real em memória usando Bun.SQL

describe("UseCase: RegisterNewPatient (Integration with Bun.SQL)", () => {
  let repo: PatientSQLiteRepository;
  // Tipagem inferida do retorno da factory inMemoryEventBus
  let eventBus: ReturnType<typeof inMemoryEventBus>;
  let useCase: RegisterNewPatientUseCase;

  beforeEach(async () => {
    new SQL(":memory:");
    repo = new PatientSQLiteRepository(new SQL(":memory:"));
    eventBus = inMemoryEventBus(); // Instancia o adaptador oficial
    useCase = new RegisterNewPatientUseCase(repo, eventBus);
  });

  test("Cenário A: Deve registrar um novo paciente com sucesso e publicar eventos", async () => {
    const input: RegisterNewPatientInput = {
      personId: "018f4a7a-1e37-7b2c-8f00-123456789abc",
      initialDiagnoses: [
        {
          icdCode: "A00.0",
          description: "Diagnóstico inicial",
          date: new Date("2023-01-01"),
        },
      ],
    };

    const result = await useCase.execute(input);

    expect(result.isOk).toBe(true);
    expect(result.unwrap()).toBe(true);

    const count = await repo.count();
    expect(count).toBe(1);

    // Validação usando a API do adaptador oficial
    expect(eventBus.published.length).toBeGreaterThan(0);
    expect(eventBus.published[0].name).toBe("PatientCreated");
  });

  test("Cenário B: Deve falhar se o PersonId já existir (Comportamento de Unicidade)", async () => {
    const personIdStr = "018f4a7a-1e37-7b2c-8f00-123456789abc";

    const input1: RegisterNewPatientInput = {
      personId: personIdStr,
      initialDiagnoses: [
        {
          icdCode: "A00.0",
          description: "Diagnóstico inicial",
          date: new Date("2023-01-01"),
        },
      ],
    };
    await useCase.execute(input1);

    eventBus.clear(); // Limpa usando método do adaptador
    const initialCount = await repo.count();
    expect(initialCount).toBe(1);

    const input2: RegisterNewPatientInput = {
      personId: personIdStr,
      initialDiagnoses: [
        {
          icdCode: "B00.0",
          description: "Outro Diagnóstico",
          date: new Date("2023-02-01"),
        },
      ],
    };

    const result = await useCase.execute(input2);

    expect(result.isErr).toBe(true);
    const error = result.unwrapErr();
    expect(error.code).toBe("APP-003");
    expect(error.message).toBe("O PersonId já existe.");

    const finalCount = await repo.count();
    expect(finalCount).toBe(1);

    expect(eventBus.published.length).toBe(0);
  });
});
