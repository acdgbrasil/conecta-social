export enum LOCAL_LOCALIZATION {
    urban = "URBAN",
    rural = "RURAL"
}

export class ReferencePerson {

    fullName: string
    socialNane: string
    motherName: string
    nis?: string
    cpf: string
    diagnosis: string
    rg: RG
    isShelter: boolean
    localLocalization: string
    cep?: string
    adress: string
    neighborhood: string
    adressNumber: string
    adressComplement: string
    state: string
    city: string
    phone: string


    constructor(fullName: string, socialName: string, motherName: string,nis: string | undefined, cpf: string, diagnosis: string, rgNumber: string, rgUf: string, rgIssuingBody: string,rgIssueDate: string, isShelter: boolean, localLocalization: LOCAL_LOCALIZATION, cep: string | undefined, adress: string, neighborhood: string, adressNumber: string, adressComplement: string, state: string, city: string, phone: string) {
        const rg = new RG(rgNumber, rgUf, rgIssuingBody, rgIssueDate)
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
        this.socialNane = socialName
    }

}


class RG {
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