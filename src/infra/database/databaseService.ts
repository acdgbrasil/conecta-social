import { User } from '../../domain/entity/user';
import {informationEducationCondition, PhotoResponse, UserRepository} from '../../domain/repository/userRepository';
import { CustomError } from '../error/error';
import {changePassword, create, createADM, deactivateUser, findByEmail, listAllUsers} from '../database/postgress/postgressDTO'
import { AuthRepository } from '../../domain/repository/authRepository';
import { createCode, findCode } from './mongodb/mongoDtos/mongodbDto';
import { AdmRepository } from '../../domain/repository/admRepository';
import { ReferencePerson } from '../../domain/entity/referencePerson';
import { Observations } from '../../domain/entity/observations';
import { createReferencePerson, createReferencePersonObservation, getByIdReferencePerson, listAllReferencePerson } from './mongodb/mongoDtos/personReferenceDTO';
import { FirstEntryInUnity } from '../../domain/entity/firstEntryInUnity';
import { createFirstEntryInUnity, createFirstEntryInUnityObservation, getFirstEntryInUnity } from './mongodb/mongoDtos/firstEntryInUnityDTO';
import { FamilyCompositionPerson, FamilyComposition, Documents, WorkConditionPerson, EducationConditionPerson, Pregnant } from '../../domain/entity/familyComposition';
import { createDocuments, createEtnicalEspecifications, createFamilyCompositionObservation, createFamilyEducationCondition, createFamilyPerson, createPregnant, createSocialEspecifications, familyHelphyConditionDto, getFamilyCompositonPersonsDto, getInformationOfPersonAndAgeAreInSchool } from './mongodb/mongoDtos/familyCompositionDto';
import { HomeConditions } from '../../domain/entity/homeConditions';
import { createHomeConditionsdDTO, createHomeConditionsObservation } from './mongodb/mongoDtos/homeConditionsModelDTO';
import { getPersonReferencePhotoDto } from './mongodb/mongoDtos/photoFamilyDto';
import { WorkCondition } from '../../domain/entity/workCondition';
import { createWorkConditionPersonDto, workConditionObservation } from './mongodb/mongoDtos/workConditionDto';
import { FamilySituationViolation } from '../../domain/entity/familySituationViolation';
import { familySituationViolenceDTO, familySituationViolenceObservation } from './mongodb/mongoDtos/familySituationViolenceDTO';
import { HelphyConditionFamily } from '../../domain/entity/familyHelphyCondition';
import { HelphyCondition } from '../../domain/entity/healthCondition';
import { createHelphyConditionDto } from './mongodb/mongoDtos/helphConditionDto';
export class DatabaseService implements UserRepository, AuthRepository,AdmRepository{
    createSituationViolationObservation(situationViolationId: string, observation: Observations): Promise<FamilySituationViolation> {
        try{
            const familySituation = familySituationViolenceObservation(situationViolationId, observation);
            return familySituation;
        }catch(e){
            throw e;
        }
    }
    createHelphyConditionObservation(helphyConditionId: string, observation: Observations): Promise<HelphyCondition> {
        throw new Error('Method not implemented.');
    }
    async createHelphyCondition(HelphyCondition: HelphyCondition, helphyConditionId: string, familyHelphyCondition: HelphyConditionFamily, familyCompositionID: string, personId: string,pregnant:Pregnant): Promise<HelphyCondition> {
        try{
            const helphyCondition = await createHelphyConditionDto(HelphyCondition,helphyConditionId);
            const _ = await familyHelphyConditionDto(familyHelphyCondition, familyCompositionID, personId);
            const __ = await createPregnant(pregnant,familyCompositionID,personId);
            return helphyCondition;
        }catch(e){
            throw e;
        }
    }
    createWorkConditionObservation(workConditionId: string, observation: string): Promise<WorkCondition> {
        try{
            const workCondition = workConditionObservation(workConditionId, observation);
            return workCondition;
        }catch(e){
            throw e;
        }
    }
    getInformationOfPersonAndAgeAreInSchool(familyCompositionId: string): Promise<informationEducationCondition> {
        try{
            const information = getInformationOfPersonAndAgeAreInSchool(familyCompositionId);
            return information;
        }catch(e){
            throw e;
        }
    }
    
    async getFamilyCompositonPersons(familyCompositionId: string): Promise<FamilyCompositionPerson[]> {
        try{
            const familyCompositionPersons = await getFamilyCompositonPersonsDto(familyCompositionId);
            return familyCompositionPersons;
        }catch(e){
            throw e;
        }
    }

    async createEducationalEspecifications(educationalEspecifications: EducationConditionPerson, familySituationId: string,personId:string): Promise<FamilyComposition> {
        try{
            const familySituation = await createFamilyEducationCondition(educationalEspecifications,familySituationId,personId);
            return familySituation;
        }catch(e){
            throw e;
        }
    }
    createSituationViolation(situationViolation: FamilySituationViolation, familySituationId: string): Promise<FamilySituationViolation> {
        try{
            const familySituation = familySituationViolenceDTO(familySituationId, situationViolation);
            return familySituation;
        }catch(e){
            throw e;
        }
    }
    
    
    async createWorkConditionPerson(workCondition: WorkCondition,workConditionPerson:WorkConditionPerson,familyCompositionID: string,personId:String,workConditionId:string): Promise<WorkCondition> {
        try{
            const workConditionResult = await createWorkConditionPersonDto(workCondition, workConditionPerson, familyCompositionID, personId, workConditionId);
            return workConditionResult;
        }catch(e){
            throw e;
        }
    }
    
    getPersonReferencePhoto(photoId: string): Promise<PhotoResponse> {
        try{
            const photo = getPersonReferencePhotoDto(photoId);
            return photo;
        }catch(e){
            throw e;
        }
    }
    
    async createHomeConditions(homeConditions: HomeConditions, homeConditionsId: string): Promise<HomeConditions | Error> {
        try{
            const familyComposition = await createHomeConditionsdDTO(homeConditions, homeConditionsId);
            return familyComposition;
        }catch(e){
            throw e;
        }
    }
    
    createHomeConditionsObservation(observation: Observations, homeConditionsId: string): Promise<HomeConditions | Error> {
        try{
            const familyComposition = createHomeConditionsObservation(observation, homeConditionsId);
            return familyComposition;
        }catch(e){
            throw e;
        }
    }
    async createEtnicalEspecifications(etnicalEspecifications: string, familyCompositionID: string): Promise<FamilyComposition | Error> {
        try{
            const familyComposition = await createEtnicalEspecifications(etnicalEspecifications, familyCompositionID);
            return familyComposition;
        }catch(e){
            throw e;
        }
    }
    async createDocuments(documents: Documents, familyCompositionID: string, id: string): Promise<FamilyComposition | Error> {
        try{
            const familyComposition = await createDocuments(documents, familyCompositionID, id);
            return familyComposition;
        }catch(e){
            throw e;
        }
    }
    async createSocialEspecifications(socialEspecifications: string, familyCompositionID: string): Promise<FamilyComposition | Error> {
        try{
            const familyComposition = await createSocialEspecifications(socialEspecifications, familyCompositionID);
            return familyComposition;
        }catch(e){
            throw e;
        }
    }
    async createFamilyCompositionObservation(observation: Observations, familyCompositionID: string): Promise<FamilyComposition | Error> {
        try{
            const observationResult = await createFamilyCompositionObservation(observation, familyCompositionID);
            return observationResult;
        }catch(e){
            throw e;
        }
    }
    async createFamilyPerson(familyCompositionPerson: FamilyCompositionPerson, familyCompositionID: string): Promise<FamilyComposition | Error> {
        try{
            const familyComposition = await createFamilyPerson(familyCompositionPerson, familyCompositionID);
            return familyComposition;
        }catch(e){
            throw e;
        }
    }
    async getFirstEntryInUnity(firstEntryInUnityId: string): Promise<FirstEntryInUnity | Error> {
        try{
            const firstEntry = await getFirstEntryInUnity(firstEntryInUnityId);
            return firstEntry;
        }catch(e){
            throw e;
        }
    }
    createFirstEntryInUnityObservation(firstEntryInUnityId: string, observation: Observations): Promise<FirstEntryInUnity | Error> {
        try{
            const firstEntry = createFirstEntryInUnityObservation(firstEntryInUnityId, observation);
            return firstEntry;
        }catch(e){
            throw e;
        }
    }

    async firstEntryInUnity(firstEntry: FirstEntryInUnity, firstEntryInUnityId: string): Promise<FirstEntryInUnity | Error> {
        try{
            const firstEntryResult = await createFirstEntryInUnity(firstEntry,firstEntryInUnityId);
            return firstEntryResult;
        }catch(e){
            throw e;
        }
    }
    
    async getReferencePersonWithObservations(id: string): Promise<ReferencePerson | Error> {
        throw new Error('Method not implemented.');
    }
    async getByIdReferencePerson(id: string): Promise<ReferencePerson | Error> {
        try {
            const referencePerson = await getByIdReferencePerson(id)
            if(!referencePerson){
                return new CustomError('REFERENCE_PERSON_NOT_FOUND', 404, 'REFERENCE_PERSON_NOT_FOUND', 'Reference Person not found')
            }
            return referencePerson
        }catch(err){
            throw err
        }
    }
    async listAllReferencePerson(): Promise<ReferencePerson[]> {
        try {
            const referencePersons = await listAllReferencePerson()
            return referencePersons
        } catch (err) {
            throw err
        }
    }
    async createReferencePersonObservation(observations: Observations, referencePersonId: string): Promise<Observations | Error> {
        try {
            const Observations = await createReferencePersonObservation(observations, referencePersonId)
            return observations
        } catch (err) {
            throw err
        }
    }
   
    async createReferencePerson(referencePerson: ReferencePerson): Promise<ReferencePerson | Error> {
        try {
            const rp = await createReferencePerson(referencePerson)
            return rp            
        } catch (err) {
            throw err
        }
    }
    
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
        console.log(hasCode)
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