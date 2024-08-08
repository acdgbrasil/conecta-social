import mongoose from "mongoose";
import { MongooseClientSingleton } from "./mongooseClientSingleton";
import { CodeModel } from "./mongoModels";
import { ReferencePerson } from "../../../domain/entity/referencePerson";
import { referencePersonModel } from "./models/referencePersonModel";
import { familyPhotoModel } from "./models/familyPhotoModel";




export const connectionMongose = async () => {
    try {
        const client = await mongoose.connect('mongodb+srv://gabrieladeraldo:tomate98@cluster0.rp1kbki.mongodb.net/conecta-social');
        return client;
    } catch (error) {
        console.log('Error to connect MongoDB', error);
    }
}


export const testConnection = () => {
    const client:mongoose.Mongoose = MongooseClientSingleton.getInstance;
    if(client && client.connection.readyState === 1){
        console.log('Mongose is connected');
    }
}

export const createCode = async (code:string) => {
    try{
        const expiredCode = CodeModel.create({code:code});
        return expiredCode;
    }catch(error){
        throw new Error('Error to create code');
    }
}

export const findCode = async (code:string) => {
    try{
        const expiredCode = await CodeModel.findOne({
            code:code
        });
        return expiredCode;
    }catch(error){
        throw new Error('Error to find code');
    }
}


export const createReferencePerson = async (rp:ReferencePerson)=>{
    try {
        const familyPhoto = await familyPhotoModel.create({
            fileBuffer:rp.familyPhoto.fileBuffer,
            fileExtension:rp.familyPhoto.fileExtension
        })
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
            state:rp.state
        })
        
        return referencePerson
        
    } catch (error) {
       throw error
    }
   }
   

export const deleteCode = async (code:string) => {
    try{
        const expiredCode = await CodeModel.deleteOne({
            code:code
        });
        return expiredCode;
    }catch(error){
        throw new Error('Error to delete code');
    }
}