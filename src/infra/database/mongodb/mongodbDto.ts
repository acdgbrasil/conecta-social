import mongoose from "mongoose";
import { MongooseClientSingleton } from "./mongooseClientSingleton";
import { CodeModel } from "./mongoModels";

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