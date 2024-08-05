import mongoose from "mongoose";
import { MongooseClientSingleton } from "./mongooseClientSingleton";

//const client:mongoose.Mongoose = MongooseClientSingleton.getInstance;
const FIVE_MINUTES = 60 * 15;
const codeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
      },
      createdAt: { type: Date, expires: FIVE_MINUTES, default: Date.now,index:true },
      expireAt: {
        type: Date,
        expires: FIVE_MINUTES,
        default: Date.now
    }
});


codeSchema.index({createdAt: 1},{expireAfterSeconds: FIVE_MINUTES});
export const CodeModel = mongoose.model('Code', codeSchema);
