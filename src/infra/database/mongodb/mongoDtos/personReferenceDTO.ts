import { Observations } from "../../../../domain/entity/observations";
import { ReferencePerson } from "../../../../domain/entity/referencePerson";
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
            throw new Error('ReferencePerson not found');
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
        const familyPhoto = await familyPhotoModel.create({
            fileBuffer:rp.familyPhoto.fileBuffer,
            fileExtension:rp.familyPhoto.fileExtension
        })
        
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
            fistEntryInUnityId:fistEntryInUnity.id
        })
        
        return referencePerson
        
    } catch (error) {
       throw error
    }
   }