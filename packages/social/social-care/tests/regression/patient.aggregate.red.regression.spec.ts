import { describe, expect, test } from "bun:test";
import { Patient, PersonId, Diagnosis, ICDCode, Timestamp } from "@conecta/social-care";
import { Uuid } from "@conecta/uuid";
import { ImutableListFactory } from "@conecta/fn";

const makeDiagnosis = () => {
  const referenceDate = Timestamp.create({ value: new Date("2024-01-10T12:00:00Z") }).unwrap();
  return Diagnosis.create(
    {
      id: ICDCode.create("A00.0").unwrap(),
      date: referenceDate,
      description: "Diagnóstico válido para cenário RED.",
    },
    referenceDate,
  ).unwrap();
};

describe("Patient.entity - red scenarios", () => {
  test("deve impedir criação do paciente mesmo com dados iniciais válidos", () => {
    const patientId = Uuid.create().unwrap();
    const personId = PersonId.create().unwrap();
    const diagnoses = ImutableListFactory.fromArray([makeDiagnosis()]);

    const result = Patient.create(patientId, personId, diagnoses);

    expect(result.isErr).toBe(true);
  });
});
