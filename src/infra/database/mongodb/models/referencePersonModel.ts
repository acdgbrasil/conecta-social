import mongoose, { Schema } from "mongoose";
import { ReferencePerson } from "../../../../domain/entity/referencePerson";

const referencePerson = new mongoose.Schema<ReferencePerson>();

export const ReferencePersonModel = mongoose.model('ReferencePerson',referencePerson);