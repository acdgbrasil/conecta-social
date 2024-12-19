import { get } from "http";
import { Documents, EducationConditionPerson, FamilyCompositionPerson } from "../../../../domain/entity/familyComposition";
import { Observations } from "../../../../domain/entity/observations";
import { CustomError } from "../../../error/error";
import { familyCompositionModel } from "../models/familyCompositionModel";

export const getFamilyCompositonPersonsDto = async (familyCompositionId:string) => {
    try {
        const referencePerson = await familyCompositionModel.findById(familyCompositionId)
        if(!referencePerson) throw new CustomError('REFERENCE_PERSON_NOT_FOUND',404,'REFERENCE_PERSON_NOT_FOUND','Reference Person not found')
        return referencePerson.familyCompositionPerson
    } catch (err) {
        throw err 
    }
}

 export const getInformationOfPersonAndAgeAreInSchool = async (familyCompositionID:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        const informationEducationCondition = familyComposition.familyCompositionPerson.map((person) => {
            const birthDate = person.birthDate
            const age = new Date().getFullYear() - new Date(birthDate).getFullYear()
            const educationCondition = person.educationConditionPerson?.isStudying
            return {age,educationCondition}
        })
        
        return informationEducationCondition
    } catch (err) {
        throw err 
    }
}

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

export const createFamilyEducationCondition = async (educationCondition:EducationConditionPerson,familyCompositionID:string,id:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        const familyCompositionPerson = familyComposition.familyCompositionPerson.find((person:any) => person._id == id)
        if(!familyCompositionPerson) throw new CustomError('FAMILY_COMPOSITION_PERSON_NOT_FOUND',404,'FAMILY_COMPOSITION_PERSON_NOT_FOUND','Family Composition Person not found')
        familyCompositionPerson.educationConditionPerson = educationCondition
        familyComposition.isInUse = true
        familyComposition.save()
        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const familyHelphyCondition = async (familyHelphyCondition:any,familyCompositionID:string,id:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        const familyCompositionPerson = familyComposition.familyCompositionPerson.find((person:any) => person._id == id)
        if(!familyCompositionPerson) throw new CustomError('FAMILY_COMPOSITION_PERSON_NOT_FOUND',404,'FAMILY_COMPOSITION_PERSON_NOT_FOUND','Family Composition Person not found')
        familyCompositionPerson.helphyConditionFamily = familyHelphyCondition
        familyComposition.isInUse = true
        familyComposition.save()
        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const familyComunitaryConvivation = async (familyComunitaryConvivation:any,familyCompositionID:string,id:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        const familyCompositionPerson = familyComposition.familyCompositionPerson.find((person:any) => person._id == id)
        if(!familyCompositionPerson) throw new CustomError('FAMILY_COMPOSITION_PERSON_NOT_FOUND',404,'FAMILY_COMPOSITION_PERSON_NOT_FOUND','Family Composition Person not found')
        familyCompositionPerson.familyComunitaryConvivation = familyComunitaryConvivation
        familyComposition.isInUse = true
        familyComposition.save()
        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const createParticipationAndSocialServices = async (participationAndSocialServices:any,familyCompositionID:string,id:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        const familyCompositionPerson = familyComposition.familyCompositionPerson.find((person:any) => person._id == id)
        if(!familyCompositionPerson) throw new CustomError('FAMILY_COMPOSITION_PERSON_NOT_FOUND',404,'FAMILY_COMPOSITION_PERSON_NOT_FOUND','Family Composition Person not found')
        familyCompositionPerson.participationAndSocialServices = participationAndSocialServices
        familyComposition.isInUse = true
        familyComposition.save()
        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const createPregnant = async (pregnant:any,familyCompositionID:string,id:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        const familyCompositionPerson = familyComposition.familyCompositionPerson.find((person:any) => person._id == id)
        if(!familyCompositionPerson) throw new CustomError('FAMILY_COMPOSITION_PERSON_NOT_FOUND',404,'FAMILY_COMPOSITION_PERSON_NOT_FOUND','Family Composition Person not found')
        familyCompositionPerson.pregnant = pregnant
        familyComposition.isInUse = true
        familyComposition.save()
        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const createWorkCondition = async (workCondition:any,familyCompositionID:string,id:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        const familyCompositionPerson = familyComposition.familyCompositionPerson.find((person:any) => person._id == id)
        if(!familyCompositionPerson) throw new CustomError('FAMILY_COMPOSITION_PERSON_NOT_FOUND',404,'FAMILY_COMPOSITION_PERSON_NOT_FOUND','Family Composition Person not found')
        familyCompositionPerson.workConditionPerson = workCondition
        familyComposition.isInUse = true
        familyComposition.save()
        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const createFamilyHistorySocioEducation = async (familyHistorySocioEducation:any,familyCompositionID:string,id:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        const familyCompositionPerson = familyComposition.familyCompositionPerson.find((person:any) => person._id == id)
        if(!familyCompositionPerson) throw new CustomError('FAMILY_COMPOSITION_PERSON_NOT_FOUND',404,'FAMILY_COMPOSITION_PERSON_NOT_FOUND','Family Composition Person not found')
        familyCompositionPerson.familyHistorySocioEducation = familyHistorySocioEducation
        familyComposition.isInUse = true
        familyComposition.save()
        return familyComposition
    } catch (err) {
        throw err 
    }
}

export const createFamilyInstitutionalHistory = async (familyInstitutionalHistory:any,familyCompositionID:string,id:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        const familyCompositionPerson = familyComposition.familyCompositionPerson.find((person:any) => person._id == id)
        if(!familyCompositionPerson) throw new CustomError('FAMILY_COMPOSITION_PERSON_NOT_FOUND',404,'FAMILY_COMPOSITION_PERSON_NOT_FOUND','Family Composition Person not found')
        familyCompositionPerson.familyInstitutionalHistory = familyInstitutionalHistory
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

export const getFamilyComposition = async (familyCompositionID:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        return familyComposition
    } catch (err) {
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
