import { ok, err, type Result } from "@conecta/result";
import { describe, test, expect, mock, beforeEach } from "bun:test";
import { inMemoryEventBus } from "@conecta/adapters";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.protocol";
import { RegisterNewPatientUseCase } from "../../use-cases/register-patient.use-case";
import { AppError } from "../../errors/application.error";
import type { Patient } from "@conecta/social-care";

const VALID_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abc";
const VALID_DATE = new Date("2024-01-01T10:00:00Z");

type MockedFn<T extends (...args: any[]) => any> = ReturnType<typeof mock<T>>;
type PatientRepositoryMock = {
  save: MockedFn<PatientRepositoryPort["save"]>;
  findByPersonId: MockedFn<PatientRepositoryPort["findByPersonId"]>;
  addFamilyMember: MockedFn<PatientRepositoryPort["addFamilyMember"]>;
  existsByPersonId: MockedFn<PatientRepositoryPort["existsByPersonId"]>;
};

describe("UseCase: RegisterNewPatient", () => {
  let repository: PatientRepositoryMock;
  let eventBus: any;
  let useCase: RegisterNewPatientUseCase;

  beforeEach(() => {
    repository = {
      save: mock(async () => ok(undefined)),
      existsByPersonId: mock(async () => ok(false)),
      findByPersonId: mock(async () => err(AppError.RepositoryNotAvailable())),
      addFamilyMember: mock(),
    };

    eventBus = inMemoryEventBus();
    useCase = new RegisterNewPatientUseCase(repository, eventBus);
  });

  test("deve criar novo paciente, salvar e publicar evento", async () => {
    const input = {
      personId: VALID_UUID,
      initialDiagnoses: [
        {
          icdCode: "A00.1",
          date: VALID_DATE,
          description: "Diagnóstico Inicial",
        },
      ],
    };

    const result = await useCase.execute(input);

    expect(result.isOk).toBe(true);
    expect(repository.save).toHaveBeenCalled();
    
    const savedPatient = repository.save.mock.calls[0][0] as Patient;
    expect(savedPatient).toBeDefined();
    expect(savedPatient.personId.toString()).toBe(VALID_UUID);
    expect(savedPatient.diagnoses.count()).toBe(1);
    
    // Validar eventos
    expect(eventBus.published.length).toBe(1);
    const event = eventBus.published[0];
    expect(event.name).toBe("PatientCreated");
    expect(event.payload).toMatchObject({
      patientId: savedPatient.id.toString(),
      personId: VALID_UUID,
    });
  });

  test("deve falhar se PersonId for inválido", async () => {
    const result = await useCase.execute({
      personId: "invalid-uuid",
      initialDiagnoses: [],
    });

    expect(result.isErr).toBe(true);
    expect(repository.save).not.toHaveBeenCalled();
  });

  test("deve falhar se paciente já existe", async () => {
    repository.existsByPersonId.mockResolvedValue(ok(true));

    const input = {
      personId: VALID_UUID,
      initialDiagnoses: [
        {
          icdCode: "A00.1",
          date: VALID_DATE,
          description: "Diagnóstico Inicial",
        },
      ],
    };

    const result = await useCase.execute(input);

    expect(result.isErr).toBe(true);
    expect(result.unwrapErr().code).toBe(AppError.PersonIdAlreadyExists().code);
    expect(repository.save).not.toHaveBeenCalled();
  });

  test("deve falhar se diagnósticos iniciais forem inválidos (CID)", async () => {
    const input = {
      personId: VALID_UUID,
      initialDiagnoses: [
        {
          icdCode: "", // Inválido
          date: VALID_DATE,
          description: "Diagnóstico Inválido",
        },
      ],
    };

    const result = await useCase.execute(input);

    expect(result.isErr).toBe(true);
    expect(repository.save).not.toHaveBeenCalled();
  });
  
  test("deve falhar se repositório falhar no existsByPersonId", async () => {
     repository.existsByPersonId.mockResolvedValue(
       err(AppError.RepositoryNotAvailable()),
     );
 
     const input = {
       personId: VALID_UUID,
       initialDiagnoses: [
         {
           icdCode: "A00.1",
           date: VALID_DATE,
           description: "Diagnóstico Inicial",
         },
       ],
     };
 
     const result = await useCase.execute(input);
 
     expect(result.isErr).toBe(true);
     expect(result.unwrapErr().code).toBe("APP-002");
  });

  test("deve falhar se repositório falhar no save", async () => {
      repository.save.mockResolvedValue(err(AppError.RepositoryNotAvailable()));
      
      const input = {
        personId: VALID_UUID,
        initialDiagnoses: [
          {
            icdCode: "A00.1",
            date: VALID_DATE,
            description: "Diagnóstico Inicial",
          },
        ],
      };
  
      const result = await useCase.execute(input);
  
      expect(result.isErr).toBe(true);
      expect(result.unwrapErr().code).toBe("APP-002");
   });
});
