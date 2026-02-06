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
const hasDbEnv =
  !!process.env.SC_DB_USER &&
  !!process.env.SC_DB_PASSWORD &&
  !!process.env.SC_DB_NAME;

let sql: ReturnType<typeof createBunSqlAdapter> | null = null;

const VALID_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abc";

const describeOrSkip = hasDbEnv ? describe : describe.skip;

describeOrSkip("PostgresPatientRepository (Integration)", () => {
  let repository: PostgresPatientRepository;

  beforeAll(async () => {
    sql = createBunSqlAdapter({
      host: process.env.SC_DB_HOST ?? "localhost",
      port: Number(process.env.SC_DB_PORT ?? 5433),
      user: process.env.SC_DB_USER,
      password: process.env.SC_DB_PASSWORD,
      database: process.env.SC_DB_NAME,
    });
    repository = new PostgresPatientRepository(sql!);
    // Limpeza inicial opcional
    await sql!`DELETE FROM patients WHERE person_id = ${VALID_UUID}`;
  });

  afterAll(async () => {
    await sql?.close();
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
    expect(ImutableListFactory.count(recovered.appointments)).toBe(1);
    expect(ImutableListFactory.count(recovered.referrals)).toBe(1);
    expect(ImutableListFactory.getAll(recovered.appointments)[0].summary).toBe("Resumo do atendimento");
  });
});
