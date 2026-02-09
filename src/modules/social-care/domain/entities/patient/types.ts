import { type DeepReadonly, type ImutableList } from "@conecta/fn";
import { Option } from "@conecta/option";
import { Uuid } from "@conecta/uuid";
import { Aggregate } from "@conecta/shared/aggregate-root/aggregate";
import {
  CommunitySupportNetwork,
  Diagnosis,
  HousingCondition,
  PersonId,
  SocialHealthSummary,
  SocioEconomicSituation,
} from "../../value-objects";
import { FamilyMember } from "../FamilyMember.entity";
import { Referral } from "../Referral.entity";
import { RightsViolationReport } from "../RightsViolationReport.entity";
import { SocialCareAppointment } from "../SocialCareAppointment.entity";

/**
 * Estado interno do Agregado Patient.
 */
export type PatientProps = {
  readonly personId: PersonId;
  readonly diagnoses: ImutableList<Diagnosis>;
  readonly familyMembers: ImutableList<FamilyMember>;
  readonly appointments: ImutableList<SocialCareAppointment>;
  readonly referrals: ImutableList<Referral>;
  readonly violationsReports: ImutableList<RightsViolationReport>;
  readonly housingCondition: Option<HousingCondition>;
  readonly socioeconomicSituation: Option<SocioEconomicSituation>;
  readonly communitySupportNetwork: Option<CommunitySupportNetwork>;
  readonly socialHealthSummary: Option<SocialHealthSummary>;
};

/**
 * O Agregado Patient como um tipo puro e imutável.
 */
export type Patient = Aggregate<PatientProps>;
