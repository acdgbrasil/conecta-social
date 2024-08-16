import { Observations } from "./observations";

export class Documents{
    cn: boolean;
    rg: boolean;
    ctps: boolean;
    cpf: boolean;
    te: boolean;

    constructor(cn:boolean, rg:boolean, ctps:boolean, cpf:boolean, te:boolean){
        this.cn = cn;
        this.rg = rg;
        this.ctps = ctps;
        this.cpf = cpf;
        this.te = te;
    }    
}

export class FamilyCompositionPerson{
    fullName: string;
    birthDate: Date;
    biologicalGender: string;
    personWithDisability: boolean;
    documents: Documents[];
    kinship: number;

    constructor(fullName:string, birthDate:Date, biologicalGender:string, personWithDisability:boolean, documents:Documents[], kinship:number){
        this.fullName = fullName;
        this.birthDate = birthDate;
        this.biologicalGender = biologicalGender;
        this.personWithDisability = personWithDisability;
        this.documents = documents;
        this.kinship = kinship;
    }
}
export class FamilyComposition{
    socialEspecification: string;
    familyCompositionPerson: FamilyCompositionPerson[];
    espeficationEthnicity: string;
    observation: Observations[];
    isInUse: boolean;

    constructor(socialEspecification:string, familyCompositionPerson:FamilyCompositionPerson[], espeficationEthnicity:string,observation:Observations[],isInUse:boolean){
        this.socialEspecification = socialEspecification;
        this.familyCompositionPerson = familyCompositionPerson;
        this.espeficationEthnicity = espeficationEthnicity;
        this.observation = observation;
        this.isInUse = isInUse;
    }
}