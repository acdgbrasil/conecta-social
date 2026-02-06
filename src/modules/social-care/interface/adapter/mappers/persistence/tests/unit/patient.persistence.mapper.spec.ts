import { describe, test, expect } from "bun:test";
import {
  mapPatientPersistenceToDomain,
  mapPatientToPersistence,
  type DiagnosisRow,
  type PatientRow,
} from "../../patient.persistence.mapper";
import {
  Diagnosis,
  HousingCondition,
  ICDCode,
  Patient,
  PersonId,
  SocialBenefitsCollection,
  SocioEconomicSituation,
  Timestamp,
} from "@conecta/social-care";
import {
  ACCESSIBILITY_LEVEL,
  ELECTRICITY_ACCESS,
  HOUSING_CONDITION_TYPE,
  SEWAGE_DISPOSAL_METHOD,
  WALL_MATERIAL,
  WASTE_COLLECTION_TYPE,
  WATER_SUPPLY_TYPE,
} from "@conecta/social-care/domain/value-objects/props/housingCondition.props";
import { ImutableListFactory } from "@conecta/fn";
import { Uuid } from "@conecta/uuid";

const VALID_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abc";

const createPatientFixture = () => {
  const personId = PersonId.create(VALID_UUID).unwrap();
  const now = Timestamp.create({ value: new Date("2024-01-02T00:00:00Z") }).unwrap();
  const icd = ICDCode.create("A00.0").unwrap();
  const diagnosis = Diagnosis.create(
    {
      id: icd,
      date: now,
      description: "Diagnostico inicial",
    },
    now,
  ).unwrap();

  let patient = Patient.createFromScratch(
    personId,
    ImutableListFactory.fromArray([diagnosis]),
  ).unwrap();

  const housing = HousingCondition.create({
    housingConditionType: HOUSING_CONDITION_TYPE.OWNED,
    wallMaterial: WALL_MATERIAL.MASONRY,
    numberOfRooms: 4,
    numberOfBathrooms: 2,
    waterSupplyType: WATER_SUPPLY_TYPE.PUBLIC_NETWORK,
    electricityAccess: ELECTRICITY_ACCESS.METERED_CONNECTION,
    sewerDisposalMethod: SEWAGE_DISPOSAL_METHOD.PUBLIC_SEWER,
    wasteCollectionType: WASTE_COLLECTION_TYPE.DIRECT_COLLECTION,
    accessibilityLevel: ACCESSIBILITY_LEVEL.FULLY_ACCESSIBLE,
    isInGeographicRiskArea: false,
    isInSocialConflictArea: false,
  }).unwrap();

  const benefits = SocialBenefitsCollection.create([]).unwrap();
  const socio = SocioEconomicSituation.create({
    totalFamilyIncome: 2000,
    incomePerCapita: 1000,
    receivesSocialBenefit: false,
    socialBenefits: benefits,
    mainSourceOfIncome: "Trabalho",
    hasUnemployed: false,
  }).unwrap();

  patient = patient.updateHousingCondition(housing).unwrap();
  patient = patient.updateSocioEconomicSituation(socio).unwrap();

  return { patient, now };
};

describe("PatientPersistenceMapper", () => {
  test("mapPatientToPersistence serializa JSONB e filhos", () => {
    const { patient } = createPatientFixture();
    const snapshot = mapPatientToPersistence(patient);

    expect(snapshot.patient.id).toBe(patient.id.toString());
    expect(snapshot.patient.housing_condition).not.toBeNull();
    expect(snapshot.patient.socioeconomic_situation).not.toBeNull();
    expect(snapshot.diagnoses.length).toBe(1);
  });

  test("mapPatientPersistenceToDomain reconstrói agregado", () => {
    const { patient, now } = createPatientFixture();
    const snapshot = mapPatientToPersistence(patient);

    const patientRow: PatientRow = {
      ...snapshot.patient,
      created_at: now.toDate(),
      updated_at: now.toDate(),
    };

    const diagnosesRows: DiagnosisRow[] = snapshot.diagnoses.map((row) => ({
      ...row,
      id: Uuid.create().unwrap().toString(),
    }));

    const result = mapPatientPersistenceToDomain({
      patient: patientRow,
      diagnoses: diagnosesRows,
      familyMembers: snapshot.familyMembers,
      appointments: snapshot.appointments,
      referrals: snapshot.referrals,
      violations: snapshot.violations,
    });

    expect(result.isOk).toBe(true);

    const reconstituted = result.unwrap();
    expect(reconstituted.personId.toString()).toBe(patient.personId.toString());
    expect(ImutableListFactory.count(reconstituted.diagnoses)).toBe(1);
  });

  test("retorna erro quando encontra dados inválidos na persistência", () => {
    const { patient, now } = createPatientFixture();
    const snapshot = mapPatientToPersistence(patient);

    const patientRow: PatientRow = {
      ...snapshot.patient,
      created_at: now.toDate(),
      updated_at: now.toDate(),
    };

    const diagnosesRows: DiagnosisRow[] = snapshot.diagnoses.map((row) => ({
      ...row,
      id: Uuid.create().unwrap().toString(),
      icd_code: "INVALID",
    }));

    const result = mapPatientPersistenceToDomain({
      patient: patientRow,
      diagnoses: diagnosesRows,
      familyMembers: snapshot.familyMembers,
      appointments: snapshot.appointments,
      referrals: snapshot.referrals,
      violations: snapshot.violations,
    });

    expect(result.isErr).toBe(true);
    if (result.isErr) {
      const ctx = result.error.context as Record<string, unknown>;
      expect(ctx.issueCount).toBe(1);
      expect(Array.isArray(ctx.issues)).toBe(true);
    }
  });
});
