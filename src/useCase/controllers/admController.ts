import { AdmRepository } from "../../domain/repository/admRepository";
import { DatabaseService } from "../../infra/database/databaseService";

export class AdmController implements AdmRepository{
    
    async createSuperAdm(name: string, email: string): Promise<Boolean | Error> {
        const databaseService = new DatabaseService();
        try{
            const superAdm = await databaseService.createSuperAdm(name, email);
            return superAdm ? true : false;
        }catch(err){
            throw err;
        }
    }
}