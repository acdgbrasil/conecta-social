import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { PostgresPatientRepository } from "../../repositories/postgres-patient.repository";
import { 
  Patient, 
  PersonId, 
  ICDCode, 
  Diagnosis, 
  Timestamp 
} from "../../../index";
import { ImutableListFactory } from "@conecta/fn";
import { Uuid } from "@conecta/uuid";
import { createBunSqlAdapter } from "@conecta/runtime/bun/sql.adapter";

// Conexão real usando o adaptador agnóstico para o runtime Bun
const sql = createBunSqlAdapter({
  host: "localhost",
  port: 5433,
  user: process.env.SC_DB_USER,
  password: process.env.SC_DB_PASSWORD,
  database: process.env.SC_DB_NAME,
});

const VALID_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abc";

describe("PostgresPatientRepository (Integration)", () => {
  let repository: PostgresPatientRepository;

  beforeAll(async () => {
    repository = new PostgresPatientRepository(sql);
    // Limpeza inicial opcional
    await sql`DELETE FROM patients WHERE person_id = ${VALID_UUID}`;
  });

  afterAll(async () => {
    await sql.close();
  });

  test("deve salvar e recuperar um agregado completo com sucesso", async () => {
    const personId = PersonId.create(VALID_UUID).unwrap();
    const icd = ICDCode.create("A00.0").unwrap();
    const now = Timestamp.create({ value: new Date() }).unwrap();
    
    // 1. Criar Agregado
    const diagnosis = Diagnosis.create({
      id: icd,
      date: now,
      description: "Diagnóstico de teste"
    }, now).unwrap();
    
    let patient = Patient.createFromScratch(
      personId, 
      ImutableListFactory.fromArray([diagnosis])
    ).unwrap();

    // 2. Adicionar Atendimento
    patient = patient.registerAppointment({
        summary: "Resumo do atendimento",
        actionPlan: "Plano de ação",
        professionalInChargeId: Uuid.create(VALID_UUID).unwrap(),
        date: now,
        type: "FOLLOW_UP"
    }, now.toDate()).unwrap();

    // 3. Adicionar Encaminhamento
    patient = patient.createReferral({
        referredPersonId: personId,
        destinationService: "CRAS",
        reason: "Necessidade de auxílio",
        date: now,
        professionalId: VALID_UUID
    }, now.toDate()).unwrap();

    // 4. Salvar
    const saveResult = await repository.save(patient);
    expect(saveResult.isOk).toBe(true);

    // 5. Recuperar
    const findResult = await repository.findByPersonId(personId);
    expect(findResult.isOk).toBe(true);
    
    const recovered = findResult.unwrap();
    expect(recovered.id.toString()).toBe(patient.id.toString());
    expect(recovered.appointments.count()).toBe(1);
    expect(recovered.referrals.count()).toBe(1);
    expect(recovered.appointments.getAll()[0].summary).toBe("Resumo do atendimento");
  });
});
