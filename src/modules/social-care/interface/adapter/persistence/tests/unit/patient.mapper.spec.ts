import { describe, expect, test } from "bun:test";
import { Patient, PersonId, Diagnosis, ICDCode, Timestamp } from "@conecta/social-care";
import { Result } from "@conecta/result";
import { List } from "@conecta/fn";
import { PatientPersistenceMapper, type PatientPersistenceRow } from "../../patient.mapper";
import { Option } from "@conecta/option";
import { Uuid } from "@conecta/uuid";

describe("PatientPersistenceMapper", () => {
  const createBasePatient = () => {
    const personId = Result.unwrap(PersonId.create("018f4a7a-1e37-7b2c-8f00-123456789abc"));
    const diagnosis = Result.unwrap(Diagnosis.create({
      id: Result.unwrap(ICDCode.create("A00.0")),
      date: Result.unwrap(Timestamp.create({ value: new Date() })),
      description: "Test"
    }, Result.unwrap(Timestamp.create({ value: new Date() }))));
    return Result.unwrap(Patient.createFromScratch(personId, List.from([diagnosis])));
  };

  test("deve mapear paciente para o modelo de persistência", () => {
    const patient = createBasePatient();
    const row = PatientPersistenceMapper.toPersistence(patient);

    expect(row.id).toBe(patient.id.toString());
    expect(row.person_id).toBe(patient.props.personId.toString());
    expect(row.housing_condition).toBeNull();
    expect(row.socioeconomic_situation).toBeNull();
  });

  test("deve reconstituir o agregado a partir de uma row (toDomain)", () => {
    const raw: PatientPersistenceRow = {
      id: "018f4a7a-1e37-7b2c-8f00-123456789abc",
      person_id: "018f4a7a-1e37-7b2c-8f00-999999999999",
      housing_condition: JSON.stringify({ housingConditionType: "OWNED", numberOfRooms: 4 }),
      socioeconomic_situation: null,
      community_support_network: null,
      social_health_summary: null,
      version: 5
    };

    const result = PatientPersistenceMapper.toDomain(raw);

    expect(Result.isOk(result)).toBe(true);
    const patient = Result.unwrap(result);
    
    expect(patient.id.toString()).toBe(raw.id);
    expect(patient.props.personId.toString()).toBe(raw.person_id);
    expect(patient.version).toBe(5);
    
    expect(Option.isSome(patient.props.housingCondition)).toBe(true);
    const housing = Option.unwrap(patient.props.housingCondition) as any;
    expect(housing.housingConditionType).toBe("OWNED");
    expect(housing.numberOfRooms).toBe(4);
    
    expect(Option.isNone(patient.props.socioeconomicSituation)).toBe(true);
  });

  test("deve lidar com JSONB já convertido pelo driver", () => {
    const raw: any = {
      id: "018f4a7a-1e37-7b2c-8f00-123456789abc",
      person_id: "018f4a7a-1e37-7b2c-8f00-999999999999",
      housing_condition: { housingConditionType: "RENTED", numberOfRooms: 2 },
      socioeconomic_situation: null,
    };

    const result = PatientPersistenceMapper.toDomain(raw);

    expect(Result.isOk(result)).toBe(true);
    const patient = Result.unwrap(result);
    
    expect(Option.isSome(patient.props.housingCondition)).toBe(true);
    const housing = Option.unwrap(patient.props.housingCondition) as any;
    expect(housing.housingConditionType).toBe("RENTED");
  });

  test("deve retornar erro se o id ou personId forem inválidos", () => {
    const raw: any = {
      id: "invalid-uuid",
      person_id: "018f4a7a-1e37-7b2c-8f00-999999999999",
    };

    const result = PatientPersistenceMapper.toDomain(raw);
    expect(Result.isErr(result)).toBe(true);
  });

  test("toDomain deve ignorar JSON inválido e retornar Option.none", () => {
    const raw: PatientPersistenceRow = {
      id: "018f4a7a-1e37-7b2c-8f00-123456789abc",
      person_id: "018f4a7a-1e37-7b2c-8f00-999999999999",
      housing_condition: "{invalid-json",
      socioeconomic_situation: null,
      community_support_network: null,
      social_health_summary: null,
      version: 1,
    };

    const result = PatientPersistenceMapper.toDomain(raw);

    expect(Result.isOk(result)).toBe(true);
    const patient = Result.unwrap(result);
    expect(Option.isNone(patient.props.housingCondition)).toBe(true);
  });

  test("toPersistence serializa campos opcionais quando presentes", () => {
    const base = createBasePatient();
    const patient = Patient.reconstitute(Result.unwrap(Uuid.create(base.id.toString())), {
      ...base.props,
      housingCondition: Option.some({ wallMaterial: "MASONRY" } as any),
      socioeconomicSituation: Option.some({ totalFamilyIncome: 1200 } as any),
      communitySupportNetwork: Option.some({ hasSupportFromRelatives: true } as any),
      socialHealthSummary: Option.some({ details: "ok" } as any),
    }, base.version);

    const row = PatientPersistenceMapper.toPersistence(patient);

    expect(row.housing_condition).toContain("MASONRY");
    expect(row.socioeconomic_situation).toContain("1200");
    expect(row.community_support_network).toContain("hasSupportFromRelatives");
    expect(row.social_health_summary).toContain("details");
  });
});
