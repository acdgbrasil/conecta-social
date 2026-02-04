import { ok, err } from "@conecta/result";
import { describe, test, expect, mock, beforeEach } from "bun:test";
import { inMemoryEventBus, systemClock } from "@conecta/adapters";
import {
  Diagnosis,
  ICDCode,
  P,
  Patient,
  PersonId,
  Timestamp,
} from "packages/conecta-raros/social-care";
import type { PatientRepositoryProtocol } from "@conecta/social-care/domain/repository/patient.repository.protocol";
import { ImutableListFactory } from "@conecta/fn";
import { RegisterAppointmentUseCase } from "@conecta/social-care/application/use-cases/register-appointment.use-case";

const NOW = new Date("2025-01-01T12:00:00Z");
const PATIENT_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abc";
const PROF_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abd";

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
  patient.pullDomainEvents(); // Limpa eventos de criação (PatientCreated)
  return patient;
};

describe("UseCase: RegisterAppointment", () => {
  let repository: PatientRepositoryProtocol;
  let eventBus: any;
  let clock: any;
  let useCase: RegisterAppointmentUseCase;

  beforeEach(() => {
    repository = {
      save: mock(async () => ok(undefined)),
      findByPersonId: mock(async () =>
        err(P.PatientNotFound({ id: PATIENT_UUID })),
      ),
      existsByPersonId: mock(),
      addFamilyMember: mock(),
    } as any;

    eventBus = inMemoryEventBus();
    clock = {
      now: mock(() => NOW),
    };
    useCase = new RegisterAppointmentUseCase(repository, eventBus, clock);
  });

  test("deve registrar um atendimento com sucesso", async () => {
    const patient = makePatient();
    (repository.findByPersonId as any).mockResolvedValue(ok(patient));

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      professionalId: PROF_UUID,
      summary: "Atendimento de rotina",
      actionPlan: "Manter acompanhamento",
      date: NOW,
      type: "FOLLOW_UP",
    });

    expect(result.isOk).toBe(true);
    expect(repository.save).toHaveBeenCalled();

    const savedPatient = (repository.save as any).mock.calls[0][0] as Patient;
    expect(savedPatient.appointments.count()).toBe(1);
    
    // Validar eventos
    expect(eventBus.published.length).toBe(1);
    expect(eventBus.published[0].name).toBe("SocialCareAppointmentRegistered");
  });

  test("deve retornar erro quando o paciente não existe", async () => {
    (repository.findByPersonId as any).mockResolvedValue(
      err(P.PatientNotFound({ id: PATIENT_UUID })),
    );

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      professionalId: PROF_UUID,
      summary: "Atendimento",
    });

    expect(result.isErr).toBe(true);
    expect(repository.save).not.toHaveBeenCalled();
  });

  test("deve falhar se os dados do atendimento forem inválidos (ex: data futura)", async () => {
    const patient = makePatient();
    (repository.findByPersonId as any).mockResolvedValue(ok(patient));

    const futureDate = new Date(NOW.getTime() + 100000);

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      professionalId: PROF_UUID,
      summary: "Atendimento futuro",
      date: futureDate,
    });

    expect(result.isErr).toBe(true);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
