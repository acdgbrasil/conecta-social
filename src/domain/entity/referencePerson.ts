export class ReferencePerson {
    fullName:string;
    socialName:string;
    motherName:string;
    nis:string | undefined;
    cpf:string;
    situation:string;
    state:boolean;
    rgNumber:string;
    rgIssuer:string;
    rgState:string;
    postalCode:string | undefined;
    address:string;
    adressNumber:string;
    neighborhood:string;
    phone:string;
    city:string;
    locationType:string;
    orderNumber:string;
    whoIsTheResponsible:string;

    constructor(fullName:string, socialName:string, motherName:string, nis:string | undefined, cpf:string, situation:string, state:boolean, rgNumber:string, rgIssuer:string, rgState:string, postalCode:string | undefined, address:string, adressNumber:string, neighborhood:string, phone:string, city:string, locationType:string, orderNumber:string,whoIsTheResponsible:string) {
        this.fullName = fullName;
        this.socialName = socialName;
        this.motherName = motherName;
        this.nis = nis;
        this.cpf = cpf;
        this.situation = situation;
        this.state = state;
        this.rgNumber = rgNumber;
        this.rgIssuer = rgIssuer;
        this.rgState = rgState;
        this.postalCode = postalCode;
        this.address = address;
        this.adressNumber = adressNumber;
        this.neighborhood = neighborhood;
        this.phone = phone;
        this.city = city;
        this.locationType = locationType;
        this.orderNumber = orderNumber;
        this.whoIsTheResponsible = whoIsTheResponsible;
    }
}