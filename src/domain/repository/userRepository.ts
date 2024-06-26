import { User } from "../entity/user";

export interface UserRepository {
    findByEmail(email:string): Promise<User | Error>;
    create(user:User): Promise<User | Error>;
    delete(email:string): Promise<User | Error>;
}