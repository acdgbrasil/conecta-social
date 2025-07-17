import { User } from "../entity/user.ts"

export interface AdmRepository {
    deactivateUser(email:string):Promise<Boolean| Error>
    listAllUsers():Promise<User[] | Error>
}