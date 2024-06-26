import { User } from '../../domain/entity/user';
import {UserRepository} from '../../domain/repository/userRepository';
import { CustomError } from '../error/error';
import {findByEmail} from '../database/postgress/postgressDTO'
export class DatabaseService implements UserRepository{
    create(user: User): Promise<User | Error> {
        throw new Error('Method not implemented.');
    }
    findByEmail(email: string): Promise<User | Error> {
        try{
            const user = findByEmail(email);
            return user;
        }catch(e){
            throw e;
        }
    }

    delete(email: string): Promise<User | Error> {
        throw new Error('Method not implemented.');
    }

}