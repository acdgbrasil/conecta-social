import { FamilyAndCommunity } from "../entity/familyAndCommunity";
import { Documents, EducationConditionPerson, FamilyComposition, FamilyCompositionPerson, Pregnant, WorkConditionPerson } from "../entity/familyComposition";
import { FamilyComunitaryConvivation } from "../entity/familyComunitaryConvivation";
import { FamilyEventlyBenefits } from "../entity/familyEnvetlyBenefits";
import { HelphyConditionFamily } from "../entity/familyHelphyCondition";
import { FamilyHistoryInstitutionalComplet } from "../entity/familyHistoryInstitutionalComplet";
import { FamilyHistoryOfComplianceSocioEducationalMeasures } from "../entity/familyHistoryOfComplianceSocioEducationalMeasures";
import { FamilyHistorySocioEducation } from "../entity/familyHistorySocioEducation";
import { FamilyInstitucionalHistory } from "../entity/familyInstitucionalHistory";
import { FamilySituationViolation } from "../entity/familySituationViolation";
import { FirstEntryInUnity } from "../entity/firstEntryInUnity";
import { HelphyCondition } from "../entity/healthCondition";
import { HomeConditions } from "../entity/homeConditions";
import { Observations } from "../entity/observations";
import { ReferencePerson } from "../entity/referencePerson";
import { User } from "../entity/user";
import { WorkCondition } from "../entity/workCondition";

export type PhotoResponse = {
    fileBuffer:Buffer;
    fileExtension:string;
}

export type informationEducationCondition = {
    age: number;
    educationCondition: boolean | undefined;
}[]

export interface UserRepository {
    findByEmail(email:string):Promise<any>;
    create(user:User,isAdm:boolean): Promise<User | Error>;
    delete(email:string): Promise<User | Error>;
    createReferencePerson(referencePerson:ReferencePerson): Promise<ReferencePerson | Error>;
    createReferencePersonObservation(observations:Observations,referencePersonId:string): Promise<Observations | Error>;
    listAllReferencePerson(): Promise<ReferencePerson[] | Error>;
    getByIdReferencePerson(id:string): Promise<ReferencePerson | Error>;
    getReferencePersonWithObservations(id:string): Promise<ReferencePerson | Error>;
    firstEntryInUnity(firstEntry:FirstEntryInUnity,firstEntryInUnityId:string): Promise<FirstEntryInUnity | Error>;
    getFirstEntryInUnity(firstEntryInUnityId:string): Promise<FirstEntryInUnity | Error>;
    createFirstEntryInUnityObservation(firstEntryInUnityId:string,observation:Observations): Promise<FirstEntryInUnity | Error>;
    createFamilyPerson(familyCompositionPerson:FamilyCompositionPerson,familyCompositionID:string): Promise<FamilyComposition | Error>;
    createEtnicalEspecifications(etnicalEspecifications:string,familyCompositionID:string): Promise<FamilyComposition | Error>;
    createDocuments(documents:Documents,familyCompositionID:string,id:string): Promise<FamilyComposition | Error>;
    createSocialEspecifications(socialEspecifications:string,familyCompositionID:string): Promise<FamilyComposition | Error>;
    createFamilyCompositionObservation(observation:Observations,familyCompositionID:string): Promise<FamilyComposition | Error>;
    createHomeConditions(homeConditions:HomeConditions,homeConditionsId:string): Promise<HomeConditions | Error>;
    createHomeConditionsObservation(observation:Observations,homeConditionsId:string): Promise<HomeConditions | Error>;
    getPersonReferencePhoto(photoId:string): Promise<PhotoResponse>;
    createSituationViolation(situationViolation:FamilySituationViolation,familySituationId:string): Promise<FamilySituationViolation>;
    createSituationViolationObservation(situationViolationId:string,observation:Observations): Promise<FamilySituationViolation>;
    createEducationalEspecifications(educationalEspecifications:EducationConditionPerson,familySituationId:string,personId:string): Promise<FamilyComposition>;
    getFamilyCompositonPersons(familyCompositionId:string): Promise<FamilyCompositionPerson[]>;
    getInformationOfPersonAndAgeAreInSchool(familyCompositionId:string): Promise<informationEducationCondition>;
    createWorkConditionObservation(workConditionId:string,observation:string): Promise<WorkCondition>;
    createHelphyCondition(HelphyCondition: HelphyCondition, helphyConditionId: string, familyHelphyCondition: HelphyConditionFamily, familyCompositionID: string, personId: string,pregnant:Pregnant): Promise<HelphyCondition>;
    createHelphyConditionObservation(helphyConditionId: string, observation: Observations): Promise<HelphyCondition>;
    createFamilyEventlyBenefits(familyEventlyBenefits:FamilyEventlyBenefits,familyEventlyBenefitsId:string): Promise<FamilyEventlyBenefits>;
    createFamilyEventlyBenefitsObservation(familyEventlyBenefitsId:string,observation:Observations): Promise<FamilyEventlyBenefits>;
    createFamilyAndCommunity(familyAndCommunity:FamilyAndCommunity,familyAndCommunityId:string): Promise<FamilyAndCommunity>;
    createFamilyAndCommunityObservation(familyAndCommunityId:string,observation:Observations): Promise<FamilyAndCommunity>;
    createFamilyComunitaryConvivationPerson(familyComunitaryConvivation:FamilyComunitaryConvivation,familyCompositionID:string,id:string): Promise<FamilyComposition>;
    createFamilyHistoryOfComplianseSocioEducationalMensure(laOrPSCInfomation:boolean, createFamilyHistoryOfComplianseSocioEducationalMensureId: string, familyHistorySocioEducation: FamilyHistorySocioEducation, familyCompositionId: string, personId: string, anotationsOfPersons: string): Promise<FamilyHistoryOfComplianceSocioEducationalMeasures>;
    createFamilyHistoryOfComplianseSocioEducationalMensureObservation(familyHistoryOfComplianseSocioEducationalMensureId:string,observation:Observations): Promise<FamilyHistoryOfComplianceSocioEducationalMeasures>;
    createFamilyHistoryInstitutionalComplets(familyHistoryInstitutionalComplet:FamilyHistoryInstitutionalComplet,familyHistoryInstitutionalCompletId:string,familuInstitucionalHistoryPerson:FamilyInstitucionalHistory,familyCompositionId:string,personId:string): Promise<FamilyHistoryInstitutionalComplet>;
    createFamilyHistoryInstitutionalCompletObservation(familyHistoryInstitutionalCompletId:string,observation:Observations): Promise<FamilyHistoryInstitutionalComplet>;
}