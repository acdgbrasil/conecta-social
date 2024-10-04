import { Documents, FamilyComposition, FamilyCompositionPerson, WorkConditionPerson } from "../entity/familyComposition";
import { FirstEntryInUnity } from "../entity/firstEntryInUnity";
import { HomeConditions } from "../entity/homeConditions";
import { Observations } from "../entity/observations";
import { ReferencePerson } from "../entity/referencePerson";
import { User } from "../entity/user";
import { WorkCondition } from "../entity/workCondition";

export type PhotoResponse = {
    fileBuffer:Buffer;
    fileExtension:string;
}

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
    createDocuments(documents:Documents,familyCompositionID:string,kinship:number): Promise<FamilyComposition | Error>;
    createSocialEspecifications(socialEspecifications:string,familyCompositionID:string): Promise<FamilyComposition | Error>;
    createFamilyCompositionObservation(observation:Observations,familyCompositionID:string): Promise<FamilyComposition | Error>;
    createHomeConditions(homeConditions:HomeConditions,homeConditionsId:string): Promise<HomeConditions | Error>;
    createHomeConditionsObservation(observation:Observations,homeConditionsId:string): Promise<HomeConditions | Error>;
    getPersonReferencePhoto(photoId:string): Promise<PhotoResponse>;
}