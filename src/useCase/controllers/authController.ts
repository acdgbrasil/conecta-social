import { User } from "../../domain/entity/user";
import { AuthRepository } from "../../domain/repository/authRepository";
import { findByEmail } from "../../infra/database/postgress/postgressDTO";
import { verifyPass } from "../../infra/encrypt/bcrypt/bcryptDto";
import { CustomError } from "../../infra/error/error";
import { createToken } from "../../infra/jwt/jwtToken";

const ONE_MOUTH = 60 * 60 * 24 * 30;

export class AuthController implements AuthRepository{

    async login(email: string, password: string): Promise<Object> {
        try{
            const hasUser = await findByEmail(email);
            if(!hasUser) throw new CustomError('USER_NOT_FOUND', 404,'USER_NOT_FOUND', 'User not found');
            if(!(hasUser.email == email)) throw new CustomError('INVALID_EMAIL', 400,'INVALID_EMAIL', 'Invalid email');
            const passIsValid = await verifyPass(password,hasUser.password);
            if(!passIsValid) throw new CustomError('INVALID_PASSWORD', 400,'INVALID_PASSWORD', 'Invalid password');
            const jwtToken = createToken(hasUser.id.toString(),ONE_MOUTH);
            return {user:hasUser,token:jwtToken};
        }catch(e){
            throw e;
        }
    }
    forgotPassword(email: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}