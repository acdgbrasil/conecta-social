import mongoose from "mongoose";
import { MongooseClientSingleton } from "./mongooseClientSingleton";
import { CodeModel } from "./mongoModels";
import { ReferencePersonModel } from "./models/referencePersonModel";
import { FirstApointmentModel } from "./models/firstApointment";

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

export const createReferencePerson = async (name:string,socialName:string,motherName:string,nis:string,cpf:string,situation:string,state:string,rgNumber:string,rgIssuer:string,rgState:string,postalCode:string,address:string,adressNumber:string,neighborhood:string,phone:string,locationType:LOCALIZATION_TYPE,orderNumber:string,whoIsTheResponsible:string,city:string) =>{
    try{
        const firstApointment = await FirstApointmentModel.create({})
        const referencePerson = await ReferencePersonModel.create({
            address:address,
            adressNumber:adressNumber,
            city:city,
            cpf:cpf,
            firstApointment:firstApointment.id,
            fullName:name,
            locationType:locationType,
            motherName:motherName,
            neighborhood:neighborhood,
            nis:nis,
            orderNumber:orderNumber,
            phone:phone,
            postalCode:postalCode,
            rgIssuer:rgIssuer,
            rgNumber:rgNumber,
            rgState:rgState,
            situation:situation,
            socialName:socialName,
            state:state,
            whoIsTheResponsible:whoIsTheResponsible
        })

        return referencePerson

    }catch(err){
        throw new Error('Error to create referencePerson');
    }
}