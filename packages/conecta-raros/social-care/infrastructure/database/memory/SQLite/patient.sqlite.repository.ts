import { ok } from "@conecta/result";
import type { SQL } from "bun";
import type {
  DomainError,
  FamilyMember,
  Patient,
  PersonId,
  Result,
} from "packages/conecta-raros/social-care";
import type { PatientRepositoryProtocol } from "packages/conecta-raros/social-care/application/protocols/patient.repository.protocol";

// Renomeado para a classe exportada e correta
export class PatientSQLiteRepository implements PatientRepositoryProtocol {
  constructor(private readonly db: SQL) {}

  async save(patient: Patient): Promise<Result<void, DomainError>> {
    try {
      // Criação da tabela inline para garantir que existe em bancos em memória voláteis
      await this.db`
                CREATE TABLE IF NOT EXISTS patients (
                    id TEXT PRIMARY KEY,
                    person_id TEXT UNIQUE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `;

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
    try {
      await this.db`
                CREATE TABLE IF NOT EXISTS patients (
                    id TEXT PRIMARY KEY,
                    person_id TEXT UNIQUE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `;
      const result = await this.db`
                SELECT 1 as exists_flag FROM patients WHERE person_id = ${personId.toString()} LIMIT 1
            `;
      return ok(result.length > 0);
    } catch (error) {
      return ok(false);
    }
  }

  async addFamilyMember(
    _familyMember: FamilyMember,
  ): Promise<Result<void, DomainError>> {
    return ok(undefined);
  }

  async count(): Promise<number> {
    const result = await this.db`SELECT count(*) as total FROM patients`;
    return Number(result[0].total);
  }
}
