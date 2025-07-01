import { PoolClient } from "pg";
import { CREATE_TABLE_USER } from "../schema/userSchema.ts";
import { createADM } from "../postgressDTO.ts";
import { User, UserRole } from "../../../../domain/entity/user.ts";
import { UserController } from "../../../../useCase/controllers/userController.ts";

export const migration_25_05_2025 = async (pgClient:PoolClient) =>{
    try{
        const controller = new UserController();
        const result = await pgClient.query(CREATE_TABLE_USER);
        const newUser = new User(0,process.env.SUPER_ADM_NAME!,process.env.SUPER_ADM_EMAIL!,process.env.SUPER_ADM_PASSWORD!,null,UserRole.admin.toString(),new Date(),new Date(),true);
        const userAdm = await controller.create(newUser, true);  
        console.log(userAdm);
    }catch(error){
        return;
    }
}