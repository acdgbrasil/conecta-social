import type { PatientRepositoryProtocol } from "@conecta/social-care/application/protocols/patient.repository.protocol";
import type { SQL } from "bun";
import type { Patient, Result, DomainError, FamilyMember, PersonId } from "src";

export class PatientSQLiteRepository implements PatientRepositoryProtocol {
  
  constructor(private readonly dbClient: SQL) {}

  save(patient: Patient): Promise<Result<void, DomainError>> {
    throw new Error("Method not implemented.");
  }
  addFamilyMember(familyMember: FamilyMember): Promise<Result<void, DomainError>> {
    throw new Error("Method not implemented.");
  }
  existsByPersonId(personId: PersonId): Promise<Result<boolean, DomainError>> {
    throw new Error("Method not implemented.");
  }
  
}

class SQLitePatientRepository implements PatientRepositoryProtocol {
  private db: SQL;

  constructor() {
    // Inicializa banco SQLite em memória
    this.db = new SQL(":memory:");
  }

  async init() {
    // Criação da tabela para simular persistência
    await this.db`
            CREATE TABLE IF NOT EXISTS patients (
                id TEXT PRIMARY KEY,
                person_id TEXT UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `;
  }

  async save(patient: Patient): Promise<Result<void, DomainError>> {
    try {
      await this.db`
                INSERT INTO patients (id, person_id)
                VALUES (${patient.id.toString()}, ${patient.personId.toString()})
                ON CONFLICT(person_id) DO NOTHING
            `;
      return ok(undefined);
    } catch (error) {
      console.error("Erro ao salvar no banco:", error);
      return ok(undefined);
    }
  }

  async existsByPersonId(
    personId: PersonId,
  ): Promise<Result<boolean, DomainError>> {
    const result = await this.db`
            SELECT 1 as exists_flag FROM patients WHERE person_id = ${personId.toString()} LIMIT 1
        `;
    return ok(result.length > 0);
  }

  async addFamilyMember(familyMember: FamilyMember): Promise<Result<void, DomainError>> { return ok(undefined); }

  async count(): Promise<number> {
    const result = await this.db`SELECT count(*) as total FROM patients`;
    return Number(result[0].total);
  }
}