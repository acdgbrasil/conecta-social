import { PrismaClient, user, UserRole } from '@prisma/client';
import { User } from '../../../domain/entity/user';
const prisma = new PrismaClient();

export async function createADM(user: User): Promise<User | Error> {
    try{
        const newUser = await prisma.user.create({
            data: {
                fullName: user.fullName,
                email: user.email,
                password: user.password,
                crm: user.crm,
                role: UserRole.admin,
            }
        });
        return new User(newUser.id,newUser.fullName,newUser.email,newUser.password,newUser.crm,newUser.role.valueOf(),newUser.createdAt,newUser.updatedAt,true);
    }catch(e){
        throw e;
    }
}

export async function create(user: User): Promise<User | Error> {
    try{
        const newUser = await prisma.user.create({
            data: {
                fullName: user.fullName,
                email: user.email,
                password: user.password,
                crm: user.crm,
                role: UserRole.user,
            }
        });
        return new User(newUser.id,newUser.fullName,newUser.email,newUser.password,newUser.crm,newUser.role.valueOf(),newUser.createdAt,newUser.updatedAt,newUser.isActive);
    }catch(e){
        throw e;
    }
}

export async function findByEmail(email: string){
    try{
        const user = await prisma.user.findUnique({where: {email}});
        if(user === null){
            return false;
        }
        const newUser: User = new User(user.id,user.fullName,user.email,user.password,user.crm,user.role.valueOf(),user.createdAt,user.updatedAt,user.isActive);
        return newUser;
    }catch(e){
        throw e;
    }
}


export async function listAllUsers(){
    try{
        const users = await prisma.user.findMany()
        const usersTransition:User[] = []
        for(var user of users){
            const newUser = new User(user.id,user.fullName,user.email,user.password,user.crm,user.role,user.createdAt,user.updatedAt,user.isActive)
            usersTransition.push(newUser)
        }
        return usersTransition
    }catch(e){
        throw e
    }
}

export async function deactivateUser(email:string){
    try{
        const user = await prisma.user.update({
            where: {email},
            data:{
                isActive:false
            }
        })
        return user
    }catch(err){
        throw err
    }
}

export async function changePassword(email: string, newPassword: string){
    try{
        const user = await prisma.user.update({
            where: {email},
            data: {
                password: newPassword
            }
        });
        return user;
    }catch(e){
        throw e;
    }
}