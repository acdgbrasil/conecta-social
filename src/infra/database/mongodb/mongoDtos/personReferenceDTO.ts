import { FamilyCompositionPerson } from "../../../../domain/entity/familyComposition";
import { Observations } from "../../../../domain/entity/observations";
import { ReferencePerson } from "../../../../domain/entity/referencePerson";
import { CustomError } from "../../../error/error";
import { familyCompositionModel } from "../models/familyCompositionModel";
import { familyPhotoModel } from "../models/familyPhotoModel";
import { firstEntryInUnityModel } from "../models/firstEntryInUnityModel";
import { referencePersonModel } from "../models/referencePersonModel";



export const getByIdReferencePerson = async (id:string) => {
    try {
        const referencePerson = await referencePersonModel.findById(id);
        return referencePerson;
    } catch (error) {
        throw error
    }
}

export const listAllReferencePerson = async () => {
    try {
        const referencePerson = await referencePersonModel.find();
        return referencePerson;
    } catch (error) {
        throw error
    }
}

export const createReferencePersonObservation = async (observations:Observations,referencePersonId:string)=>{
    try {
        const getReferencePerson = await referencePersonModel.findById(referencePersonId);
        if(!getReferencePerson){
            throw new CustomError('REFERENCE_PERSON_NOT_FOUND',404,'REFERENCE_PERSON_NOT_FOUND','Reference Person not found');
        }

        getReferencePerson.observations?.push(observations);
        await getReferencePerson.save();
        return getReferencePerson;
    } catch (error) {
        throw error
    }
}

export const createReferencePerson = async (rp:ReferencePerson)=>{
    try {
        
        const _referencePerson = await referencePersonModel.findOne({cpf:rp.cpf});

        if(_referencePerson){
            throw new CustomError('CPF_ALREADY_EXISTS',400,'CPF_ALREADY_EXISTS','CPF already exists');
        }
        
        const familyPhoto = await familyPhotoModel.create({
            fileBuffer:rp.familyPhoto.fileBuffer,
            fileExtension:rp.familyPhoto.fileExtension
        })
        
        const familyComposition = await familyCompositionModel.create({})
        const familyCompositionReferencePerson = new FamilyCompositionPerson(rp.fullName,rp.birthDate,rp.biologicalGender,true,[],1)
        familyComposition.familyCompositionPerson.push(familyCompositionReferencePerson)
        familyComposition.save()

        const fistEntryInUnity = await firstEntryInUnityModel.create({})

        const referencePerson = await referencePersonModel.create({
            fullName:rp.fullName,
            socialName:rp.socialName,
            adress:rp.adress,
            adressComplement:rp.adressComplement,
            adressNumber:rp.adressNumber,
            cep:rp.cep,
            city:rp.city,
            cpf:rp.cpf,
            diagnosis:rp.diagnosis,
            familyPhoto:familyPhoto.id,
            isShelter:rp.isShelter,
            localLocalization:rp.localLocalization,
            motherName:rp.motherName,
            neighborhood:rp.neighborhood,
            nis:rp.nis,
            phone:rp.phone,
            rg:rp.rg,
            state:rp.state,
            whoIsOpeningId:rp.whoIsOpeningId,
            fistEntryInUnityId:fistEntryInUnity.id,
            familyCompositionId:familyComposition.id,
            birthDate:rp.birthDate,
            biologicalGender:rp.biologicalGender,
        })
        
        return referencePerson
        
    } catch (error) {
       throw error
    }
   }