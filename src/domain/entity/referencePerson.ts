import { FirstEntryInUnity } from "./firstEntryInUnity"
import { Observations } from "./observations"

export enum LOCAL_LOCALIZATION {
    urban = "URBAN",
    rural = "RURAL"
}

export class ReferencePerson {

    fullName: string
    socialName: string
    motherName: string
    biologicalGender:string
    nis?: string
    cpf: string
    diagnosis: string
    rg: RG
    isShelter: boolean
    localLocalization: string
    birthDate:Date
    cep?: string
    adress: string
    neighborhood: string
    adressNumber: string
    adressComplement: string
    state: string
    city: string
    phone: string
    familyPhoto:FamilyPhoto
    createdAt?: Date
    updatedAt?: Date
    observations?: [Observations]
    familyCompositionId?: string
    homeConditionsId?: string
    fistEntryInUnityId?: FirstEntryInUnity
    whoIsOpeningId: string



    constructor(fullName: string, socialName: string, motherName: string,nis: string | undefined, cpf: string, diagnosis: string, rgNumber: string,biologicalGender:string, rgUf: string, rgIssuingBody: string,rgIssueDate: string, isShelter: boolean, localLocalization: LOCAL_LOCALIZATION, cep: string | undefined, adress: string, neighborhood: string, adressNumber: string, adressComplement: string, state: string, city: string, phone: string,fileBuffer:Buffer, fileExtension:string,birthDate:Date,whoIsOpeningId:string,observations?: [Observations],familyCompositionId?: string, fistEntryInUnityId?: FirstEntryInUnity,homeConditionsId?: string) {
        const rg = new RG(rgNumber, rgUf, rgIssuingBody, rgIssueDate)
        const familyPhoto = new FamilyPhoto(fileBuffer,fileExtension)
        this.familyPhoto = familyPhoto
        this.rg = rg
        this.adress = adress
        this.adressComplement = adressComplement
        this.adressNumber = adressNumber
        this.cep = cep
        this.city = city
        this.cpf = cpf
        this.diagnosis = diagnosis
        this.fullName = fullName
        this.isShelter = isShelter
        this.localLocalization = localLocalization
        this.neighborhood = neighborhood
        this.state = state
        this.phone = phone
        this.motherName = motherName
        this.socialName = socialName
        this.observations = observations
        this.whoIsOpeningId = whoIsOpeningId
        this.nis = nis
        this.familyCompositionId = familyCompositionId
        this.fistEntryInUnityId = fistEntryInUnityId
        this.birthDate = birthDate 
        this.biologicalGender = biologicalGender
        this.homeConditionsId = homeConditionsId
    }
}

export class FamilyPhoto{
    fileBuffer:Buffer
    fileExtension:string
    constructor(fileBufer:Buffer,fileExtension:string){
        this.fileBuffer = fileBufer
        this.fileExtension = fileExtension
    }
}

export class RG {
    number: string
    uf: string
    issuingBody: string
    issueDate: string

    constructor(number: string, uf: string, issuingBody: string, issueDate: string) {
        this.issueDate = issueDate
        this.number = number
        this.uf = uf
        this.issuingBody = issuingBody
    }
}