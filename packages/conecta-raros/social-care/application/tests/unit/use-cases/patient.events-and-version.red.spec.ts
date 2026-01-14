import { describe, expect, test } from "bun:test";
import { ImutableListFactory } from "@conecta/fn";
import {
  Diagnosis,
  FamilyMember,
  FamilyMemberId,
  ICDCode,
  Patient,
  PersonId,
  Timestamp,
} from "packages/conecta-raros/social-care";

const makeDiagnosis = () => {
  const icd = ICDCode.create("A00").unwrap();
  const today = Timestamp.create({
    value: new Date("2024-01-10T00:00:00Z"),
  }).unwrap();
  const now = Timestamp.create({
    value: new Date("2024-01-10T12:00:00Z"),
  }).unwrap();
  return Diagnosis.create(
    {
      id: icd,
      date: today,
      description: "Cólera devida a Vibrio cholerae 01, biótipo cholerae",
    },
    now,
  ).unwrap();
};

const makePatient = () => {
  const personId = PersonId.create().unwrap();
  const diagnoses = ImutableListFactory.fromArray([makeDiagnosis()]);
  const patientResult = Patient.createFromScratch(personId, diagnoses);
  if (patientResult.isErr) throw patientResult.unwrapErr();
  return patientResult.unwrap();
};

const makeFamilyMember = () => {
  const result = FamilyMember.create({
    id: FamilyMemberId.create().unwrap(),
    personId: PersonId.create().unwrap(),
    relationship: "pai",
    isPrimaryCaregiver: false,
    residesWithPatient: true,
  });
  if (result.isErr) throw result.unwrapErr();
  return result.unwrap();
};

describe("Patient — eventos de domínio e versionamento (RED)", () => {
  test("expõe eventos de domínio ao criar e modificar o agregado", () => {
    const patient = makePatient();

    const pullEvents = patient.pullDomainEvents;
    expect(typeof pullEvents).toBe("function");

    const eventsAfterCreate = pullEvents?.() ?? [];
    expect(eventsAfterCreate.some((evt) => evt.name === "PatientCreated")).toBe(
      true,
    );

    const added = patient.addFamilyMember(makeFamilyMember()).unwrap();
    const eventsAfterAdd = added.pullDomainEvents?.() ?? [];
    expect(eventsAfterAdd.some((evt) => evt.name === "FamilyMemberAdded")).toBe(
      true,
    );
  });

  test("mantém campo de versão para optimistic locking e incrementa a cada mudança", () => {
    const patient = makePatient();
    const initialVersion = patient.version;
    expect(initialVersion).toBe(0);

    const updated = patient.addFamilyMember(makeFamilyMember()).unwrap();
    const nextVersion = updated.version;
    expect(nextVersion).toBe(initialVersion + 1);
  });
});
