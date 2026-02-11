import { Result } from "@conecta/result";
import { Patient } from "@conecta/social-care/domain/entities";
import {
  PersonId,
  HousingCondition,
  SocioEconomicSituation,
} from "@conecta/social-care/domain/value-objects";

/**
 * Mapper funcional detalhado para reconstrução do Agregado.
 */
export const PatientPersistenceMapper = {
  toPersistence: (patient: Patient) => {
    // Usamos um cast temporário ou método de extração de props se disponível
    const props = (patient as any).props; 
    return {
      id: props.id,
      person_id: props.personId.value,
      housing_condition: props.housingCondition ? JSON.stringify(props.housingCondition) : null,
      socioeconomic_situation: props.socioEconomicSituation ? JSON.stringify(props.socioEconomicSituation) : null,
    };
  },

  toDomain: (raw: any): Result<Patient, any> => {
    return Result.combine({
      personId: PersonId.create(raw.person_id),
      // Adicionar outros VOs conforme necessário
    }).flatMap(({ personId }) => {
      // Reconstrução via Aggregate Factory
      return Patient.reconstruct({
        id: raw.id,
        personId,
        housingCondition: raw.housing_condition ? (raw.housing_condition as any) : undefined,
        socioEconomicSituation: raw.socioeconomic_situation ? (raw.socioeconomic_situation as any) : undefined,
      } as any);
    });
  }
};
