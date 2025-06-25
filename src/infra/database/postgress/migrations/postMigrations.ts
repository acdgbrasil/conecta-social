import { PoolClient } from "pg";
import { CREATE_TABLE_USER } from "../schema/userSchema";

export const migration_25_05_2025 = async (pgClient:PoolClient) =>{
    const result = await pgClient.query(CREATE_TABLE_USER);
}