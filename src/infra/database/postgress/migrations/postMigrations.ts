import { PoolClient } from "pg";
import { CREATE_TABLE_USER } from "../schema/userSchema.ts";
import { createADM } from "../postgressDTO.ts";
import { User } from "../../../../domain/entity/user.ts";

export const migration_25_05_2025 = async (pgClient:PoolClient) =>{
    const result = await pgClient.query(CREATE_TABLE_USER);
    const userAdm = new User(1,process.env.SUPER_ADM_NAME || 'Gabriel Aderaldo', process.env.SUPER_ADM_EMAIL || 'defaut',process.env.SUPER_ADM_PASSWORD || 'default', null, 'admin', new Date(), new Date(), true);
    await createADM(userAdm);
}