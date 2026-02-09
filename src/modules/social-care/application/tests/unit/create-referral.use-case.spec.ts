import { Result } from "@conecta/result";
import { describe, test, expect, mock, beforeEach } from "bun:test";
import { inMemoryEventBus } from "@conecta/adapters";
import {
  Diagnosis,
  ICDCode,
  P,
  Patient,
  PersonId,
  ReferralDestinationService,
  Timestamp,
} from "@conecta/social-care";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.protocol";
import { List } from "@conecta/fn";
import { makeCreateReferralUseCase } from "@conecta/social-care/application/use-cases/create-referral.use-case";
import type { UseCasePort } from "@conecta/shared/protocols/UseCase.protocol";
import type { CreateReferralCommand } from "@conecta/social-care/application/ports/commands/create-referral.command";
import type { DomainError } from "@conecta/domain-error";

const NOW = new Date("2025-01-01T12:00:00Z");
const PATIENT_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abc";
const REFERRED_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abc"; // Mesma ID do paciente (dentro da fronteira)
const OUTSIDE_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abd"; // Fora da fronteira

type MockedFn<T extends (...args: any[]) => any> = ReturnType<typeof mock<T>>;
type PatientRepositoryMock = {
  save: MockedFn<PatientRepositoryPort["save"]>;
  findByPersonId: MockedFn<PatientRepositoryPort["findByPersonId"]>;
  addFamilyMember: MockedFn<PatientRepositoryPort["addFamilyMember"]>;
  existsByPersonId: MockedFn<PatientRepositoryPort["existsByPersonId"]>;
};

const makePatient = (): Patient => {
  const personId = Result.unwrap(PersonId.create(PATIENT_UUID));
  const icdCode = Result.unwrap(ICDCode.create("A00.0"));
  const timestamp = Result.unwrap(Timestamp.create({ value: NOW }));
  const diagnosis = Result.unwrap(Diagnosis.create(
    { id: icdCode, date: timestamp, description: "Diagnóstico inicial" },
    timestamp,
  ));
  const diagnoses = List.from([diagnosis]);
  const patient = Result.unwrap(Patient.createFromScratch(personId, diagnoses));
  const { patient: cleanPatient } = Patient.pullDomainEvents(patient);
  return cleanPatient;
};

describe("UseCase: CreateReferral", () => {
  let repository: PatientRepositoryMock;
  let eventBus: any;
  let clock: any;
  let useCase: UseCasePort<CreateReferralCommand, Result<boolean, DomainError>>;

  beforeEach(() => {
    repository = {
      save: mock(async () => Result.ok(undefined)),
      findByPersonId: mock(async () =>
        Result.err(P.PatientNotFound({ id: PATIENT_UUID })),
      ),
      existsByPersonId: mock(),
      addFamilyMember: mock(),
    };

    eventBus = inMemoryEventBus();
    clock = {
      now: mock(() => NOW),
    };
    useCase = makeCreateReferralUseCase({ repository, eventBus, clock });
  });

  test("deve criar um encaminhamento com sucesso", async () => {
    const patient = makePatient();
    repository.findByPersonId.mockResolvedValue(Result.ok(patient));

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      referredPersonId: REFERRED_UUID,
      destinationService: ReferralDestinationService.HEALTH_CARE,
      reason: "Necessita acompanhamento psicológico",
      date: NOW,
    });

    expect(Result.isOk(result)).toBe(true);
    expect(repository.save).toHaveBeenCalled();

    const savedPatient = repository.save.mock.calls[0][0] as Patient;
    expect(List.count(savedPatient.props.referrals)).toBe(1);
    
    // Validar eventos
    expect(eventBus.published.length).toBe(1);
    expect(eventBus.published[0].name).toBe("ReferralCreated");
  });

  test("deve retornar erro quando o paciente não existe", async () => {
    repository.findByPersonId.mockResolvedValue(
      Result.err(P.PatientNotFound({ id: PATIENT_UUID })),
    );

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      referredPersonId: REFERRED_UUID,
      destinationService: ReferralDestinationService.OTHER,
      reason: "Motivo",
    });

    expect(Result.isErr(result)).toBe(true);
    expect(repository.save).not.toHaveBeenCalled();
  });

  test("deve falhar se a pessoa encaminhada estiver fora da fronteira do agregado", async () => {
    const patient = makePatient();
    repository.findByPersonId.mockResolvedValue(Result.ok(patient));

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      referredPersonId: OUTSIDE_UUID,
      destinationService: ReferralDestinationService.OTHER,
      reason: "Motivo",
    });

    expect(Result.isErr(result)).toBe(true);
    if (!Result.isErr(result)) return;
    expect(Result.unwrapErr(result).code).toBe("PAT-003");
    expect(repository.save).not.toHaveBeenCalled();
  });
});
