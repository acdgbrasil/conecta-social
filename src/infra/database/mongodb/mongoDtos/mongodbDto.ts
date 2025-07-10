import mongoose from "mongoose";
import { MongooseClientSingleton } from "../mongooseClientSingleton.ts";
import { CodeModel } from "../mongoModels.ts";
import { logError, logMongo } from "../../../../utils/fancy_console_log.ts";
require('dotenv').config();

export const connectionMongose = async () => {
    try {

        if(process.env.MONGO_LOCAL_URL == null || process.env.MONGO_LOCAL_URL == undefined || process.env.MONGO_LOCAL_URL == ''){
           logError('FAIL TO LOAD MONGO_LOCAL_URL');
            throw new Error('FAIL TO LOAD MONGO_LOCAL_URL');
        }

        if(process.env.MONGO_LOCAL_URL_PROD == null || process.env.MONGO_LOCAL_URL_PROD == undefined || process.env.MONGO_LOCAL_URL_PROD == ''){
            logError('FAIL TO LOAD MONGO_LOCAL_URL');
            throw new Error('FAIL TO LOAD MONGO_LOCAL_URL');
        }

        const client = await mongoose.connect(process.env.MONGO_LOCAL_URL_PROD);
        return client;
    } catch (error) {
        logError('Error to connect MongoDB: ' + error);
    }
}


export const testConnection = () => {
    const client:mongoose.Mongoose = MongooseClientSingleton.getInstance;
    if(client && client.connection.readyState === 1){
        logMongo("MongoDB is connected");
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