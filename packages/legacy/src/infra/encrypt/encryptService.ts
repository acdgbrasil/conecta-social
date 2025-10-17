import { CryptoRepository } from "../../domain/repository/cryptoRepository.ts";
import { CustomError } from "../error/error.ts";
import { hashPass, verifyPass } from "./bcrypt/bcryptDto.ts";

export class CryptoService implements CryptoRepository{

    hashPass(password: string): Promise<string> {
        try{
            const hasPass = hashPass(password)
            return hasPass
        }catch(e){
            throw new CustomError('Internal Server Error',500,'Hash Pass Error','Error to hash pass');
        }
    }
    verifyPass(pass: string, hash: string): Promise<boolean> {
        try{
            const hasPass = verifyPass(pass,hash)
            return hasPass
        }catch(e){
            throw new CustomError('Internal Server Error',500,'Hash Pass Error','Error to hash pass');
        }
    }
  
}