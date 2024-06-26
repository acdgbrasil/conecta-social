
export enum UserRole{
    admin,
    user
  }

export class User{
    id: number;
    fullName: string;
    email: string;
    password: string;
    crm: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    constructor(id: number, fullName: string, email: string, password: string, crm: string | null,role:string ,createdAt: Date, updatedAt: Date){
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.crm = crm;
        this.role = role;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}