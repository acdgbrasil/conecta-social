import { Result } from "@conecta/result";
import { Option } from "@conecta/option";
import type { SqlPort } from "@conecta/ports";
import type { PersonRepositoryPort } from "../../../domain/repository/person.repository.port";
import { Person } from "../../../domain/entities/person";
import { AppError } from "@conecta/social-care/application/errors/application.error";
import { Uuid } from "@conecta/uuid";

/**
 * Adaptador de persistência PostgreSQL para a entidade Person.
 */
export const makePostgresPersonRepository = (sql: SqlPort): PersonRepositoryPort => ({
  save: async (person: Person) => {
    try {
      await sql`
        INSERT INTO people (
          id, legal_name, social_name, birth_date, tax_id, email, roles, logto_user_id, version, updated_at
        ) VALUES (
          ${person.id.toString()},
          ${person.props.legalName},
          ${Option.match(person.props.socialName, { some: s => s, none: () => null })},
          ${person.props.birthDate},
          ${person.props.taxId},
          ${person.props.email},
          ${person.props.roles as string[]},
          ${Option.match(person.props.logtoUserId, { some: id => id, none: () => null })},
          ${person.version},
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          legal_name = EXCLUDED.legal_name,
          social_name = EXCLUDED.social_name,
          birth_date = EXCLUDED.birth_date,
          tax_id = EXCLUDED.tax_id,
          email = EXCLUDED.email,
          roles = EXCLUDED.roles,
          logto_user_id = EXCLUDED.logto_user_id,
          version = EXCLUDED.version,
          updated_at = NOW();
      `;
      return Result.ok(undefined);
    } catch (error) {
      console.error("[PostgresPersonRepository] Erro ao salvar pessoa:", error);
      return Result.err(AppError.RepositoryNotAvailable());
    }
  },

  findByEmail: async (email: string) => {
    try {
      const rows = await sql`SELECT * FROM people WHERE email = ${email} LIMIT 1`;
      if (rows.length === 0) {
        return Result.err({ message: "Person not found", code: "PEOPLE-404" } as any);
      }
      
      const row = rows[0] as any;
      return Result.ok(Person.create(Uuid.create(row.id).unwrap(), {
        legalName: row.legal_name,
        socialName: row.social_name ? Option.some(row.social_name) : Option.none(),
        birthDate: new Date(row.birth_date),
        taxId: row.tax_id,
        email: row.email,
        roles: row.roles,
        logtoUserId: row.logto_user_id ? Option.some(row.logto_user_id) : Option.none(),
      }));
    } catch (error) {
      return Result.err(AppError.RepositoryNotAvailable());
    }
  },

  existsByTaxId: async (taxId: string) => {
    try {
      const rows = await sql`SELECT 1 FROM people WHERE tax_id = ${taxId} LIMIT 1`;
      return Result.ok(rows.length > 0);
    } catch (error) {
      return Result.err(AppError.RepositoryNotAvailable());
    }
  }
});
