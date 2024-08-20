import { FirstEntryInUnity } from "../entity/firstEntryInUnity";
import { Observations } from "../entity/observations";
import { ReferencePerson } from "../entity/referencePerson";
import { User } from "../entity/user";

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
}