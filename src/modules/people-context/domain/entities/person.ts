import { Aggregate } from "@conecta/shared/aggregate-root/aggregate";
import type { Branded } from "@conecta/fn";
import type { Uuid } from "@conecta/uuid";
import { Option } from "@conecta/option";

/**
 * Identificador único da Pessoa (Golden Record).
 */
export type PersonId = Branded<Uuid, "PersonId">;

/**
 * Papéis que uma pessoa pode desempenhar no ecossistema.
 */
export type Role = "ADMIN" | "ASSISTANT_SOCIAL" | "VISITOR" | "PROFESSIONAL";

/**
 * Propriedades da entidade Person.
 */
export type PersonProps = {
  readonly legalName: string;
  readonly socialName: Option<string>;
  readonly birthDate: Date;
  readonly taxId: string; // CPF (Value Object futuro)
  readonly email: string;
  readonly roles: readonly Role[];
  readonly logtoUserId: Option<string>; // Vínculo com o IdP
};

/**
 * Entidade Person (Agregado Raiz do People Context).
 */
export type Person = Aggregate<PersonProps>;

/**
 * Namespace funcional para operações sobre a Pessoa.
 */
export const Person = {
  /**
   * Cria uma nova identidade a partir de dados básicos.
   */
  create(id: Uuid, props: PersonProps): Person {
    return Aggregate.of(id, props);
  },

  /**
   * Vincula um ID do Logto a esta pessoa.
   */
  linkLogtoUser(person: Person, logtoUserId: string): Person {
    return Aggregate.update(person, {
      logtoUserId: Option.some(logtoUserId),
    });
  },

  /**
   * Adiciona um papel à pessoa.
   */
  addRole(person: Person, role: Role): Person {
    if (person.props.roles.includes(role)) return person;
    return Aggregate.update(person, {
      roles: [...person.props.roles, role],
    });
  },
} as const;
