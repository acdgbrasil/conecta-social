import { User } from "../../domain/entity/user";
import { UserRepository } from "../../domain/repository/userRepository";
import { DatabaseService } from "../../infra/database/databaseService";
import { CryptoService } from "../../infra/encrypt/encryptService";
import { SmtpService } from "../../infra/smtp/smtpService";

export class UserController implements UserRepository{
    findByEmail(email: string): Promise<User | Error> {
        throw new Error("Method not implemented.");
    }
    async create(user: User, isAdm: boolean): Promise<User | Error> {
        try{
            const db = new DatabaseService();
            const cryptoService = new CryptoService();
            const hashPass = await cryptoService.hashPass(user.password);
            const newUser = new User(user.id,user.fullName,user.email,hashPass,user.crm,user.role,user.createdAt,user.updatedAt);
            const userCreate = await db.create(newUser,isAdm);
            if(userCreate != null){
                const smtp = new SmtpService();
                const email = await smtp.sendGenericEmail('noreply@acdgbrasil.com.br',newUser.email,'Cadastro Realizando com sucesso','Seu cadastro foi realizado com sucesso!');
                if(!email) throw new Error('Error to send email');
                return userCreate;
            }
            throw new Error('Error to create user');
        }
        catch(e){
            throw new Error('Internal Server Error');
        }
    }
    delete(email: string): Promise<User | Error> {
        throw new Error("Method not implemented.");
    }

}