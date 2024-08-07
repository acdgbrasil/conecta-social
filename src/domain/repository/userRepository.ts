import { ReferencePerson } from "../entity/referencePerson";
import { User } from "../entity/user";

export interface UserRepository {
    findByEmail(email:string):Promise<any>;
    create(user:User,isAdm:boolean): Promise<User | Error>;
    delete(email:string): Promise<User | Error>;
    createReferencePerson(referencePerson:ReferencePerson): Promise<ReferencePerson | Error>;
}