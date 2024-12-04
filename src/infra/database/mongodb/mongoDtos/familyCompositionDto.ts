import mongoose from "mongoose";
import { Documents, FamilyCompositionPerson } from "../../../../domain/entity/familyComposition";
import { Observations } from "../../../../domain/entity/observations";
import { CustomError } from "../../../error/error";
import { familyCompositionModel } from "../models/familyCompositionModel";

export const createFamilyPerson = async (familyCompositionPerson:FamilyCompositionPerson,familyCompositionID:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        familyComposition.familyCompositionPerson.push(familyCompositionPerson)
        familyComposition.isInUse = true 
        familyComposition.save()
        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const createEtnicalEspecifications = async (etnicalEspecifications:string,familyCompositionID:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        familyComposition.espeficationEthnicity = etnicalEspecifications
        familyComposition.isInUse = true
        familyComposition.save()
        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const createDocuments = async (documents:Documents,familyCompositionID:string,id:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        const familyCompositionPerson = familyComposition.familyCompositionPerson.find((person:any) => person._id == id)
        if(!familyCompositionPerson) throw new CustomError('FAMILY_COMPOSITION_PERSON_NOT_FOUND',404,'FAMILY_COMPOSITION_PERSON_NOT_FOUND','Family Composition Person not found')
        familyCompositionPerson.documents = documents
        familyComposition.isInUse = true
        await familyComposition.save()
        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const createSocialEspecifications = async (socialEspecifications:string,familyCompositionID:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        familyComposition.socialEspecification = socialEspecifications
        familyComposition.isInUse = true
        familyComposition.save()
        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const createFamilyCompositionObservation = async (observation:Observations,familyCompositionID:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        familyComposition.observation.push(observation)
        familyComposition.isInUse = true
        familyComposition.save()
        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const getFamilyCompositionById = async (familyCompositionID:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        return familyComposition
    } catch (err) {
        throw err 
    }
}
export const updateFamilyMemberById = async (
    familyCompositionID: string,
    familyCompositionPersonID: string,
    updateData: Partial<FamilyCompositionPerson> 
) => {
    try {

        const familyComposition = await familyCompositionModel.findOne({_id: familyCompositionID})
        console.log(familyComposition)
        if (!familyComposition) {
            throw new CustomError(
                'FAMILY_COMPOSITION_OR_MEMBER_NOT_FOUND',
                404,
                'FAMILY_COMPOSITION_OR_MEMBER_NOT_FOUND',
                'Family Composition or Member not found'
            );
        }
        //const members = familyComposition.familyCompositionPerson
       // let memberIndex  = 
        //memberIndex = -1
        //memberIndex = members.map((e:any, i)=> {
        //    if(e._id === familyCompositionPersonID){
       //         return i
       //     }
            
       // })
        //if(memberIndex === undefined){
        //    memberIndex = -1
       // }
        //familyComposition.familyCompositionPerson[memberIndex] = {
        //    ...familyComposition.familyCompositionPerson[memberIndex],
        //    ...updateData
        //  };
        
        //return familyComposition;
    } catch (err) {
        console.log(err)
        throw err;
    }
};

export const getFamilyCompositionPersonById = async (familyCompositionPersonID:string) => {
    
    try{
        const familyComposition = await familyCompositionModel.find()
        const familyCompositionPersonList = familyComposition.map((e)=>{
            return e.familyCompositionPerson
        })
        const flatArray = familyCompositionPersonList.flat()
        const familyCompositionPerson = flatArray.filter((element:any) => {
            return element._id.toString() === familyCompositionPersonID})
        return familyCompositionPerson
    }
    catch(err){
        throw err
    }
}
export const getAllFamilyComposition = async () => {
    try {
        const familyComposition = await familyCompositionModel.find()
        return familyComposition
    } catch (err) {
        throw err 
    }
}
