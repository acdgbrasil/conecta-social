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
} from "packages/conecta-raros/social-care";
import type { PatientRepositoryProtocol } from "@conecta/social-care/domain/repository/patient.repository.protocol";
import { ImutableListFactory } from "@conecta/fn";
import { UpdateSocioEconomicSituationUseCase } from "@conecta/social-care/application/use-cases/update-socioeconomic-situation.use-case";
import type { SocioEconomicSituationDTO } from "../../../dto/social-assessment.dto";

const NOW = new Date("2025-01-01T12:00:00Z");
const PATIENT_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abc";
const MEMBER_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abd";

const makePatient = (): Patient => {
  const personId = PersonId.create(PATIENT_UUID).unwrap();
  const icdCode = ICDCode.create("A00.0").unwrap();
  const timestamp = Timestamp.create({ value: NOW }).unwrap();
  const diagnosis = Diagnosis.create(
    { id: icdCode, date: timestamp, description: "Diagnóstico inicial" },
    timestamp,
  ).unwrap();
  const diagnoses = ImutableListFactory.fromArray([diagnosis]);
  return Patient.createFromScratch(personId, diagnoses).unwrap();
};

const VALID_SITUATION_DTO: SocioEconomicSituationDTO = {
  totalFamilyIncome: 2000,
  incomePerCapita: 500,
  receivesSocialBenefit: true,
  socialBenefits: [
    {
      benefitName: "Bolsa Família",
      amount: 600,
      beneficiaryId: MEMBER_UUID,
    },
  ],
  mainSourceOfIncome: "Trabalho Autônomo",
  hasUnemployed: true,
};

describe("UseCase: UpdateSocioEconomicSituation", () => {
  let repository: PatientRepositoryProtocol;
  let eventBus: any;
  let useCase: UpdateSocioEconomicSituationUseCase;

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
    useCase = new UpdateSocioEconomicSituationUseCase(repository, eventBus);
  });

  test("deve atualizar situação socioeconômica com sucesso", async () => {
    const patient = makePatient();
    (repository.findByPersonId as any).mockResolvedValue(ok(patient));

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      situation: VALID_SITUATION_DTO,
    });

    expect(result.isOk).toBe(true);
    expect(repository.save).toHaveBeenCalled();

    const savedPatient = (repository.save as any).mock.calls[0][0] as Patient;
    expect(savedPatient.socioeconomicSituation.isSome).toBe(true);
    expect(savedPatient.socioeconomicSituation.unwrap().totalFamilyIncome).toBe(
      2000,
    );
  });

  test("deve retornar erro quando o paciente não existe", async () => {
    (repository.findByPersonId as any).mockResolvedValue(
      err(P.PatientNotFound({ id: PATIENT_UUID })),
    );

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      situation: VALID_SITUATION_DTO,
    });

    expect(result.isErr).toBe(true);
    expect(repository.save).not.toHaveBeenCalled();
  });

  test("deve retornar erro quando o DTO é inválido (consistência de benefícios)", async () => {
    const patient = makePatient();
    (repository.findByPersonId as any).mockResolvedValue(ok(patient));

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      situation: {
        ...VALID_SITUATION_DTO,
        receivesSocialBenefit: true,
        socialBenefits: [], // Inválido: flag true mas lista vazia
      },
    });

    expect(result.isErr).toBe(true);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
