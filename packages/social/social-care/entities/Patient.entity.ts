import { CommunitySupportNetwork, Diagnosis, FamilyMember, HousingCondition, ImutableList, ImutableListFactory, PersonId, Referral, RightsViolationReport, SocialCareAppointment, SocialHealthSummary, SocioEconomicSituation, Uuid,  } from "src"
import { None, Option } from "@conecta/option";
import { DomainError } from "@conecta/domain-error";
import { err, ok, Result } from "@conecta/result";
import { P } from "../err/Patient.error";

export type PatientProps = {
    readonly personId: PersonId,
    readonly diagnoses: ImutableList<Diagnosis>,
    readonly familyMembers: ImutableList<FamilyMember>,
    readonly appointments: ImutableList<SocialCareAppointment>,
    readonly referrals: ImutableList<Referral>,
    readonly violationsReports: ImutableList<RightsViolationReport>,
    readonly housingCondition: Option<HousingCondition>,
    readonly socioeconomicSituation: Option<SocioEconomicSituation>,
    readonly communitySupportNetwork: Option<CommunitySupportNetwork>,
    readonly socialHealthSummary: Option<SocialHealthSummary>,
}


export class Patient {
    private constructor(private readonly props: PatientProps,private readonly patientId: Uuid) {}

    get id(): Uuid { return Object.freeze(this.patientId) }
    get personId(): PersonId { return Object.freeze(this.props.personId) }
    get diagnoses(): ImutableList<Diagnosis> { return Object.freeze(this.props.diagnoses) }
    get familyMembers(): ImutableList<FamilyMember> { return Object.freeze(this.props.familyMembers) }
    get appointments(): ImutableList<SocialCareAppointment> { return Object.freeze(this.props.appointments) }
    get referrals(): ImutableList<Referral> { return Object.freeze(this.props.referrals) }
    get violationsReports(): ImutableList<RightsViolationReport> { return Object.freeze(this.props.violationsReports) }
    get housingCondition(): Option<HousingCondition> { return Object.freeze(this.props.housingCondition) }
    get socioeconomicSituation(): Option<SocioEconomicSituation> { return Object.freeze(this.props.socioeconomicSituation) }
    get communitySupportNetwork(): Option<CommunitySupportNetwork> { return Object.freeze(this.props.communitySupportNetwork) }
    get socialHealthSummary(): Option<SocialHealthSummary> { return Object.freeze(this.props.socialHealthSummary) }



    static create(id: Uuid, personId: PersonId, diagnoses: ImutableList<Diagnosis>): Result<Patient, DomainError> {
        if(diagnoses.isEmpty()) return err(P.InitialDiagnosesCantBeEmpty());
        if(personId === null) return err(P.InitialPersonIdIsRequired());
        if(id === null) return err(P.InitialIdIsRequired());

        const initialPatientStatus: PatientProps = {
            personId,
            diagnoses,
            familyMembers: ImutableListFactory.empty<FamilyMember>(),
            appointments: ImutableListFactory.empty<SocialCareAppointment>(),
            referrals: ImutableListFactory.empty<Referral>(),
            violationsReports: ImutableListFactory.empty<RightsViolationReport>(),
            housingCondition: None(),
            socioeconomicSituation: None(),
            communitySupportNetwork: None(),
            socialHealthSummary: None(),
        };

        return ok(new Patient(initialPatientStatus, id));

    }

    copyWith(changes: Partial<PatientProps>): Patient {
        const merged: PatientProps = {
            personId: changes.personId ?? this.props.personId,
            diagnoses: changes.diagnoses ?? this.props.diagnoses,
            familyMembers: changes.familyMembers ?? this.props.familyMembers,
            appointments: changes.appointments ?? this.props.appointments,
            referrals: changes.referrals ?? this.props.referrals,
            violationsReports: changes.violationsReports ?? this.props.violationsReports,
            housingCondition: changes.housingCondition ?? this.props.housingCondition,
            socioeconomicSituation: changes.socioeconomicSituation ?? this.props.socioeconomicSituation,
            communitySupportNetwork: changes.communitySupportNetwork ?? this.props.communitySupportNetwork,
            socialHealthSummary: changes.socialHealthSummary ?? this.props.socialHealthSummary,
        };

        return new Patient(merged, this.patientId);
    }

    addFamilyMember(member: FamilyMember): Result<Patient, DomainError> {
        const existedMembers = this.familyMembers.getAll();
        const alreadyExists = existedMembers.find((m) => m.personId.equals(member.personId));
        if(alreadyExists) return err(P.FamilyMemberAlreadyExists(member.personId.value));

        const updatedMembers = this.familyMembers.add(member);
        const updatedPatient = this.copyWith({ familyMembers: updatedMembers });

        return ok(updatedPatient);
    }

    removeFamilyMember(personId: PersonId): Result<Patient, DomainError> {
        const existedMembers = this.familyMembers.getAll();
        const hasMemberToRemove = existedMembers.find((m) => m.personId.equals(personId));
        if(!hasMemberToRemove) return err(P.FamilyMemberNotFound(personId.value));

        const updatedMembers = this.familyMembers.remove(hasMemberToRemove);
        const updatedPatient = this.copyWith({ familyMembers: updatedMembers });

        return ok(updatedPatient);

    }

    
    assignPrimaryCaregiver(personId: PersonId): Result<Patient, DomainError> {
        const currentMembers = this.familyMembers.getAll();
        const hasMember = currentMembers.find((m) => m.personId.equals(personId));
        if(!hasMember) return err(P.FamilyMemberNotFound(personId.value));
        const updateMembers = currentMembers.map((member) => member.personId.equals(personId) ? member.assignAsPrimaryCaregiver() : member.revokePrimaryCaregiver());
        const updatedMembersList = ImutableListFactory.fromArray<FamilyMember>(updateMembers);
        const updatedPatient = this.copyWith({ familyMembers: updatedMembersList });
        
        return ok(updatedPatient);
    }




}