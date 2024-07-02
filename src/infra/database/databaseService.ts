import { User } from '../../domain/entity/user';
import {UserRepository} from '../../domain/repository/userRepository';
import { CustomError } from '../error/error';
import {create, createADM, findByEmail} from '../database/postgress/postgressDTO'
import { AuthRepository } from '../../domain/repository/authRepository';
export class DatabaseService implements UserRepository, AuthRepository{
    login(email: string, password: string): Promise<Object> {
        throw new Error('Method not implemented.');
    }
    forgotPassword(email: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    async create(user: User, isAdm: boolean): Promise<User | Error> {
        try{
            const hasUser = await findByEmail(user.email);
            if(hasUser !== false){
                throw new CustomError('USER_ALREADY_EXISTS', 409,'USER_ALREADY_EXISTS', 'User already exists');
            }
            if(isAdm){
                const createUser = await createADM(user);
                return createUser;
            }else{
                const createUser = await create(user);
                return createUser;
            }
        }catch(e){
            throw e;
        }
    }
    async findByEmail(email: string): Promise<any> {
        try{
            const user = await findByEmail(email);
            if(user === false){
                throw new CustomError('USER_NOT_FOUND', 404,'USER_NOT_FOUND', 'User not found');
            }
            return user;
        }catch(e){
            throw e;
        }
    }

    delete(email: string): Promise<User | Error> {
        throw new Error('Method not implemented.');
    }

}