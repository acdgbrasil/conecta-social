import { ok, err } from "@conecta/result";
import { describe, test, expect, mock, beforeEach } from "bun:test";
import { inMemoryEventBus } from "@conecta/adapters";
import {
  Diagnosis,
  ICDCode,
  P,
  Patient,
  PersonId,
  Timestamp,
} from "@conecta/social-care";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.protocol";
import { ImutableListFactory } from "@conecta/fn";
import { ReportRightsViolationUseCase } from "@conecta/social-care/application/use-cases/report-rights-violation.use-case";

const NOW = new Date("2025-01-01T12:00:00Z");
const PATIENT_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abc";
const VICTIM_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abc"; // Mesma ID (paciente é a vítima)
const OUTSIDE_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abd"; // Fora da fronteira

type MockedFn<T extends (...args: any[]) => any> = ReturnType<typeof mock<T>>;
type PatientRepositoryMock = {
  save: MockedFn<PatientRepositoryPort["save"]>;
  findByPersonId: MockedFn<PatientRepositoryPort["findByPersonId"]>;
  addFamilyMember: MockedFn<PatientRepositoryPort["addFamilyMember"]>;
  existsByPersonId: MockedFn<PatientRepositoryPort["existsByPersonId"]>;
};

const makePatient = (): Patient => {
  const personId = PersonId.create(PATIENT_UUID).unwrap();
  const icdCode = ICDCode.create("A00.0").unwrap();
  const timestamp = Timestamp.create({ value: NOW }).unwrap();
  const diagnosis = Diagnosis.create(
    { id: icdCode, date: timestamp, description: "Diagnóstico inicial" },
    timestamp,
  ).unwrap();
  const diagnoses = ImutableListFactory.fromArray([diagnosis]);
  const patient = Patient.createFromScratch(personId, diagnoses).unwrap();
  patient.pullDomainEvents();
  return patient;
};

describe("UseCase: ReportRightsViolation", () => {
  let repository: PatientRepositoryMock;
  let eventBus: any;
  let clock: any;
  let useCase: ReportRightsViolationUseCase;

  beforeEach(() => {
    repository = {
      save: mock(async () => ok(undefined)),
      findByPersonId: mock(async () =>
        err(P.PatientNotFound({ id: PATIENT_UUID })),
      ),
      existsByPersonId: mock(),
      addFamilyMember: mock(),
    };

    eventBus = inMemoryEventBus();
    clock = {
      now: mock(() => NOW),
    };
    useCase = new ReportRightsViolationUseCase(repository, eventBus, clock);
  });

  test("deve registrar um relato de violação com sucesso", async () => {
    const patient = makePatient();
    repository.findByPersonId.mockResolvedValue(ok(patient));

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      victimId: VICTIM_UUID,
      violationType: "NEGLIGENCE",
      descriptionOfFact: "Negligência observada",
      reportDate: NOW,
      incidentDate: new Date(NOW.getTime() - 10000), // Incidente no passado
    });

    expect(result.isOk).toBe(true);
    expect(repository.save).toHaveBeenCalled();

    const savedPatient = repository.save.mock.calls[0][0] as Patient;
    expect(savedPatient.violationsReports.count()).toBe(1);
    
    // Validar eventos
    expect(eventBus.published.length).toBe(1);
    expect(eventBus.published[0].name).toBe("RightsViolationReported");
  });

  test("deve retornar erro quando o paciente não existe", async () => {
    repository.findByPersonId.mockResolvedValue(
      err(P.PatientNotFound({ id: PATIENT_UUID })),
    );

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      victimId: VICTIM_UUID,
      violationType: "NEGLIGENCE",
      descriptionOfFact: "Teste",
      reportDate: NOW,
      incidentDate: NOW,
    });

    expect(result.isErr).toBe(true);
    expect(repository.save).not.toHaveBeenCalled();
  });

  test("deve falhar se a vítima estiver fora da fronteira do agregado", async () => {
    const patient = makePatient();
    repository.findByPersonId.mockResolvedValue(ok(patient));

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      victimId: OUTSIDE_UUID,
      violationType: "NEGLIGENCE",
      descriptionOfFact: "Teste",
      reportDate: NOW,
      incidentDate: NOW,
    });

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;
    expect(result.unwrapErr().code).toBe("PAT-004"); // ViolationTargetOutsideBoundary
    expect(repository.save).not.toHaveBeenCalled();
  });
});
