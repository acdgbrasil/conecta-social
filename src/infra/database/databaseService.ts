import { User } from '../../domain/entity/user';
import {UserRepository} from '../../domain/repository/userRepository';
import { CustomError } from '../error/error';
import {changePassword, create, createADM, deactivateUser, findByEmail, listAllUsers} from '../database/postgress/postgressDTO'
import { AuthRepository } from '../../domain/repository/authRepository';
import { createCode, createSuperAdm, findCode } from './mongodb/mongodbDto';
import { AdmRepository } from '../../domain/repository/admRepository';
export class DatabaseService implements UserRepository, AuthRepository,AdmRepository{
    async deactivateUser(email: string): Promise<Boolean | Error> {
        try{
            const users = await deactivateUser(email)
            return !users.isActive
        }catch(err){
            throw err
        }
    }
    async listAllUsers(): Promise<User[] | Error> {
        try{
            const users = await listAllUsers()
            return users
        }catch(err){
            throw err
        }
    }

    async resetPassword(email: string, code: string, newPassword: string): Promise<User> {
        try{
        const hasCode = await findCode(code);
        if(!hasCode){
            throw new CustomError('CODE_NOT_FOUND', 404,'CODE_NOT_FOUND', 'Code not found');
        }
        const newUser = await changePassword(email, newPassword);
        await hasCode.deleteOne();
        return newUser;
        }catch(e){
            throw e;
        }
    }
    login(email: string, password: string): Promise<Object> {
        throw new Error('Method not implemented.');
    }
    async forgotPassword(email: string): Promise<string> {
        try{
            const user = await findByEmail(email);
            if(user === false){
                throw new CustomError('USER_NOT_FOUND', 404,'USER_NOT_FOUND', 'User not found');
            }
            const code = Math.random().toString(36).substring(2, 7);
            const expiredCode = await createCode(code);
            return expiredCode.toJSON().code;
        }catch(e){
            throw e;
        }
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