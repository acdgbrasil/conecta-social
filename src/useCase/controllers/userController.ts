import { Observations } from "../../domain/entity/observations";
import { ReferencePerson } from "../../domain/entity/referencePerson";
import { User } from "../../domain/entity/user";
import { UserRepository } from "../../domain/repository/userRepository";
import { DatabaseService } from "../../infra/database/databaseService";
import { CryptoService } from "../../infra/encrypt/encryptService";
import { CustomError } from "../../infra/error/error";
import { SmtpService } from "../../infra/smtp/smtpService";

export class UserController implements UserRepository{
    getReferencePersonWithObservations(id: string): Promise<ReferencePerson | Error> {
        try{
            const db = new DatabaseService();
            return db.getReferencePersonWithObservations(id);
        }catch(e){
            throw e;
        }
    }
    getByIdReferencePerson(id: string): Promise<ReferencePerson | Error> {
        try{
            const db = new DatabaseService();
            return db.getByIdReferencePerson(id);
        }catch(e){
            throw e;
        }
    }
    listAllReferencePerson(): Promise<ReferencePerson[] | Error> {
        try{
            const db = new DatabaseService();
            return db.listAllReferencePerson();
        }catch(e){
            throw e;
        }
    }
    createReferencePersonObservation(observations: Observations, referencePersonId: string): Promise<Observations | Error> {
        try{
            const db = new DatabaseService();
            return db.createReferencePersonObservation(observations,referencePersonId);
        }catch(e){
            throw e;
        }
    }
    createReferencePerson(referencePerson: ReferencePerson): Promise<ReferencePerson | Error> {
        try {
            const db = new DatabaseService()
            const rp = db.createReferencePerson(referencePerson)
            return rp
        } catch (err) {
            throw err
        }
    }
    findByEmail(email: string): Promise<User | Error> {
        try{
            const db = new DatabaseService();
            return db.findByEmail(email);
        }catch(e){
            throw e;
        }
    }
    async create(user: User, isAdm: boolean): Promise<User | Error> {
        try{
            const db = new DatabaseService();
            const cryptoService = new CryptoService();
            const hashPass = await cryptoService.hashPass(user.password);
            const newUser = new User(user.id,user.fullName,user.email,hashPass,user.crm,user.role,user.createdAt,user.updatedAt,user.isActive);
            const userCreate = await db.create(newUser,isAdm);
            if(userCreate != null){
                const smtp = new SmtpService();
                const email = await smtp.sendGenericEmail('noreply@acdgbrasil.com.br',newUser.email,'Cadastro Realizando com sucesso','Cadastro Realizando com sucesso, a senha da sua conta é padrão. Por favor altere a senha: '+user.password);
                if(!email) throw new CustomError('Internal Server Error',500,'Internal Server Error','Error to send email')
                return userCreate;
            }
            throw new CustomError('Internal Server Error',500,'Internal Server Error','Error to create user');
        }
        catch(e){
            throw e;
        }
    }
    delete(email: string): Promise<User | Error> {
        throw new Error("Method not implemented.");
    }

}