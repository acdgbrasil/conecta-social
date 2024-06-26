import { PrismaClient, UserRole } from '@prisma/client';
import { User } from '../../../domain/entity/user';
import { CustomError } from '../../error/error';
const prisma = new PrismaClient();

export async function findByEmail(email: string): Promise<User | Error> {
    try{
        const user = await prisma.user.findUnique({where: {email}});
        if(user === null){
            throw new CustomError('USER_NOT_FOUND', 404,'USER_NOT_FOUND', 'User not found');
        }
        const newUser: User = new User(user.id,user.fullName,user.email,user.password,user.crm,user.role.valueOf(),user.createdAt,user.updatedAt);
        return newUser;
    }catch(e){
        throw e;
    }
}