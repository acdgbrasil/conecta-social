import { Result } from "@conecta/result";
import { Option } from "@conecta/option";
import { Uuid } from "@conecta/uuid";
import { List } from "@conecta/fn";
import type { DomainError } from "@conecta/shared/erros-pattern/DomainError";
import { Patient } from "@conecta/social-care/domain/entities";
import {
  PersonId,
} from "@conecta/social-care/domain/value-objects";

/**
 * Representa a estrutura de dados na tabela 'patients'.
 */
export type PatientPersistenceRow = {
  readonly id: string;
  readonly person_id: string;
  readonly housing_condition: string | null;
  readonly socioeconomic_situation: string | null;
  readonly community_support_network: string | null;
  readonly social_health_summary: string | null;
  readonly version?: number;
};

/**
 * Mapper funcional para tradução entre o Agregado de Domínio e o modelo de persistência.
 */
export const PatientPersistenceMapper = {
  /**
   * Converte o Agregado Patient para o formato de banco de dados.
   */
  toPersistence: (patient: Patient): PatientPersistenceRow => {
    const { id, props } = patient;
    
    return {
      id: id.toString(),
      person_id: props.personId.toString(),
      housing_condition: Option.match(props.housingCondition, {
        some: (val) => JSON.stringify(val),
        none: () => null,
      }),
      socioeconomic_situation: Option.match(props.socioeconomicSituation, {
        some: (val) => JSON.stringify(val),
        none: () => null,
      }),
      community_support_network: Option.match(props.communitySupportNetwork, {
        some: (val) => JSON.stringify(val),
        none: () => null,
      }),
      social_health_summary: Option.match(props.socialHealthSummary, {
        some: (val) => JSON.stringify(val),
        none: () => null,
      }),
      // A versão do agregado pode ser usada para optimistic locking
    };
  },

  /**
   * Reconstrói o Agregado Patient a partir dos dados persistidos.
   */
  toDomain: (raw: PatientPersistenceRow): Result<Patient, DomainError> => {
    const combined = Result.combine({
      id: Uuid.create(raw.id),
      personId: PersonId.create(raw.person_id),
    });

    return Result.flatMap(combined, ({ id, personId }) => {
      
      /**
       * Helper para desserialização segura de campos JSONB.
       * Suporta tanto strings (drivers que não auto-convertem) quanto objetos.
       */
      const parseJsonOption = <T>(data: string | object | null): Option<T> => {
        if (data === null || data === undefined) return Option.none();
        if (typeof data === "object") return Option.some(data as T);
        try {
          return Option.some(JSON.parse(data as string) as T);
        } catch {
          return Option.none();
        }
      };

      // Reconstituímos o agregado com as coleções vazias por enquanto.
      // TODO: O adaptador de persistência deve buscar coleções em tabelas secundárias.
      return Result.ok(
        Patient.reconstitute(id as Uuid, {
          personId,
          diagnoses: List.empty(), 
          familyMembers: List.empty(),
          appointments: List.empty(),
          referrals: List.empty(),
          violationsReports: List.empty(),
          housingCondition: parseJsonOption(raw.housing_condition),
          socioeconomicSituation: parseJsonOption(raw.socioeconomic_situation),
          communitySupportNetwork: parseJsonOption(raw.community_support_network),
          socialHealthSummary: parseJsonOption(raw.social_health_summary),
        }, raw.version ?? 0)
      );
    });
  }
};
