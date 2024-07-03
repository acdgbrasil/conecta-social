import { User } from "../../domain/entity/user";
import { AuthRepository } from "../../domain/repository/authRepository";
import { DatabaseService } from "../../infra/database/databaseService";
import { findByEmail } from "../../infra/database/postgress/postgressDTO";
import { verifyPass } from "../../infra/encrypt/bcrypt/bcryptDto";
import { CryptoService } from "../../infra/encrypt/encryptService";
import { CustomError } from "../../infra/error/error";
import { createToken } from "../../infra/jwt/jwtToken";
import { SmtpService } from "../../infra/smtp/smtpService";

const ONE_MOUTH = 60 * 60 * 24 * 30;

export class AuthController implements AuthRepository{
    
    async login(email: string, password: string): Promise<Object> {
        try{
            const databaseService = new DatabaseService();
            const hasUser = await databaseService.findByEmail(email);
            if(!(hasUser.email == email)) throw new CustomError('INVALID_EMAIL', 400,'INVALID_EMAIL', 'Invalid email');
            const passIsValid = await verifyPass(password,hasUser.password);
            if(!passIsValid) throw new CustomError('INVALID_PASSWORD', 400,'INVALID_PASSWORD', 'Invalid password');
            const jwtToken = createToken(hasUser.id.toString(),ONE_MOUTH);
            return {user:hasUser,token:jwtToken};
        }catch(e){
            throw e;
        }
    }
    async forgotPassword(email: string): Promise<string> {
        try{
            const databaseService = new DatabaseService();
            const hasUser = await databaseService.findByEmail(email);
            if(!hasUser) throw new CustomError('USER_NOT_FOUND', 404,'USER_NOT_FOUND', 'User not found');
            const expiredCode = await databaseService.forgotPassword(email);
            const smtp = new SmtpService();
            const responseEmail = await smtp.sendGenericEmail('noreply@acdgbrasil.com.br',email,'Reset de Senha','Seu codigo, para resetar sua senha é: '+expiredCode);
            if(!responseEmail) throw new CustomError('Internal Server Error',500,'Internal Server Error','Error to send email')
            return expiredCode;
        }catch(e){
            throw e;
        }
    }

    async resetPassword(email: string, code: string, newPassword: string): Promise<User> {
        try{
            const databaseService = new DatabaseService();
            const encrypt = new CryptoService();
            const hashPass = await encrypt.hashPass(newPassword);
            const user = databaseService.resetPassword(email,code,hashPass);
            return user;
        }catch(e){
            throw e;
        }
    }

}