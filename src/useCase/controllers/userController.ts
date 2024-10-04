import { FamilyCompositionPerson, FamilyComposition, Documents } from "../../domain/entity/familyComposition";
import { FirstEntryInUnity } from "../../domain/entity/firstEntryInUnity";
import { HomeConditions } from "../../domain/entity/homeConditions";
import { Observations } from "../../domain/entity/observations";
import { ReferencePerson } from "../../domain/entity/referencePerson";
import { User } from "../../domain/entity/user";
import { PhotoResponse, UserRepository } from "../../domain/repository/userRepository";
import { DatabaseService } from "../../infra/database/databaseService";
import { CryptoService } from "../../infra/encrypt/encryptService";
import { CustomError } from "../../infra/error/error";
import { SmtpService } from "../../infra/smtp/smtpService";

type ShortReferencePerson = {
    id: string
    fullName: string
    socialName: string
    motherName: string
    cpf: string
    diagnosis: string
    birthDate:Date
    cep?: string
    adress: string
    neighborhood: string
    adressNumber: string
    adressComplement: string
    phone: string
    familyPhoto: string
    whoIsOpening: string
}


export class UserController implements UserRepository{
    async getPersonReferencePhoto(photoId: string): Promise<PhotoResponse> {
        try{
            const db = new DatabaseService();
            return await db.getPersonReferencePhoto(photoId);
        }catch(e){
            throw e;
        }
    }

    createHomeConditions(homeConditions: HomeConditions, homeConditionsId: string): Promise<HomeConditions | Error> {
        try{
            const db = new DatabaseService();
            return db.createHomeConditions(homeConditions,homeConditionsId);
        }catch(e){
            throw e;
        }
    }
    createHomeConditionsObservation(observation: Observations, homeConditionsId: string): Promise<HomeConditions | Error> {
        try{
            const db = new DatabaseService();
            return db.createHomeConditionsObservation(observation,homeConditionsId);
        }catch(e){
            throw e;
        }
    }

    async createEtnicalEspecifications(etnicalEspecifications: string, familyCompositionID: string): Promise<FamilyComposition | Error> {
        try{
            const db = new DatabaseService();
            return await db.createEtnicalEspecifications(etnicalEspecifications,familyCompositionID);
        }catch(e){
            throw e;
        }
    }

    async createDocuments(documents: Documents, familyCompositionID: string, kinship: number): Promise<FamilyComposition | Error> {
        try{
            const db = new DatabaseService();
            return await db.createDocuments(documents,familyCompositionID,kinship);
        }catch(e){
            throw e;
        }
    }

    async createSocialEspecifications(socialEspecifications: string, familyCompositionID: string): Promise<FamilyComposition | Error> {
        try{
            const db = new DatabaseService();
            return await db.createSocialEspecifications(socialEspecifications,familyCompositionID);
        }catch(e){
            throw e;
        }
    }


    async createFamilyCompositionObservation(observation: Observations, familyCompositionID: string): Promise<FamilyComposition | Error> {
        try{
            const db = new DatabaseService();
            return await db.createFamilyCompositionObservation(observation,familyCompositionID);
        }catch(e){
            throw e;
        }
    }

    async createFamilyPerson(familyCompositionPerson: FamilyCompositionPerson, familyCompositionID: string): Promise<FamilyComposition | Error> {
        try{
            const db = new DatabaseService();
            return await db.createFamilyPerson(familyCompositionPerson, familyCompositionID);
        }catch(e){
            throw e;
        }
    }

    async getFirstEntryInUnity(firstEntryInUnityId: string): Promise<FirstEntryInUnity | Error> {
        try{
            const db = new DatabaseService();
            return await db.getFirstEntryInUnity(firstEntryInUnityId);
        }catch(e){
            throw e;
        }
    }
    async createFirstEntryInUnityObservation(firstEntryInUnityId: string, observation: Observations): Promise<FirstEntryInUnity | Error> {
        try{
            const db = new DatabaseService();
            return await db.createFirstEntryInUnityObservation(firstEntryInUnityId, observation);
        }catch(e){
            throw e;
        }
    }
    async firstEntryInUnity(firstEntry: FirstEntryInUnity, firstEntryInUnityId: string): Promise<FirstEntryInUnity | Error> {
        try{
            const db = new DatabaseService();
            return await db.firstEntryInUnity(firstEntry,firstEntryInUnityId);
        }catch(e){
            throw e;
        }
    }

    async getReferencePersonWithObservations(id: string): Promise<ReferencePerson | Error> {
        try{
            const db = new DatabaseService();
            return await db.getReferencePersonWithObservations(id);
        }catch(e){
            throw e;
        }
    }
    async getByIdReferencePerson(id: string): Promise<ReferencePerson | Error> {
        try{
            const db = new DatabaseService();
            return await db.getByIdReferencePerson(id);
        }catch(e){
            throw e;
        }
    }
    async listAllReferencePerson(): Promise<ReferencePerson[]> {
        try{
            const db = new DatabaseService();
            return await db.listAllReferencePerson();
        }catch(e){
            throw e;
        }
    }
    async listFamilyMembers(familyCompositionId: string): Promise<FamilyCompositionPerson[]> {
        try {
            const db = new DatabaseService();
    
            const familyComposition = await db.getFamilyComposition(familyCompositionId);
    
            if (familyComposition instanceof Error) {
                throw new Error('Erro ao buscar a composição familiar');
            }
    
            if (!familyComposition || !familyComposition.familyCompositionPerson) {
                throw new Error('familyComposition ou familyCompositionPerson não encontrado');
            }
    
            const familyMembers = familyComposition.familyCompositionPerson;
    
    
            return familyMembers;
        } catch (e) {
            
            throw e;
        }
    }
    
    async listAllReducedReferencePerson(): Promise<ShortReferencePerson[]> {
        try{
            const userControle = new UserController();
            const db = new DatabaseService();
            const ReferencePersonList = await db.listAllReferencePerson();
            const finalResponse = await Promise.all(ReferencePersonList.map(async (rp) => {
                const familyPhotoId = rp.familyPhoto.toString();
                const familyPhoto = await userControle.getPersonReferencePhoto(familyPhotoId);
    
                return {
                    id: rp.id,
                    fullName: rp.fullName,
                    socialName: rp.socialName,
                    motherName: rp.motherName,
                    cpf: rp.cpf,
                    diagnosis: rp.diagnosis,
                    birthDate: rp.birthDate,
                    cep: rp.cep,
                    adress: rp.adress,
                    neighborhood: rp.neighborhood,
                    adressNumber: rp.adressNumber,
                    adressComplement: rp.adressComplement,
                    phone: rp.phone,
                    familyPhoto: typeof familyPhoto === 'string' ? familyPhoto : JSON.stringify(familyPhoto), // Garantindo que a foto seja uma string
                    whoIsOpening: rp.whoIsOpeningId
                };
            }));
            return finalResponse
        }catch(e){
            throw e;
        }
    }
    async createReferencePersonObservation(observations: Observations, referencePersonId: string): Promise<Observations | Error> {
        try{
            const db = new DatabaseService();
            return await db.createReferencePersonObservation(observations,referencePersonId);
        }catch(e){
            throw e;
        }
    }
    async createReferencePerson(referencePerson: ReferencePerson): Promise<ReferencePerson | Error> {
        try {
            const db = new DatabaseService()
            const rp = await db.createReferencePerson(referencePerson)
            return rp
        } catch (err) {
            throw err
        }
    }
    async findByEmail(email: string): Promise<User | Error> {
        try{
            const db = new DatabaseService();
            return await db.findByEmail(email);
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
    async listAllUsers(): Promise<User[] | Error> {
        try{
            const databaseService = new DatabaseService()
            const users = await databaseService.listAllUsers()
            return users
        }catch(err){
            throw err
        }
    }

}