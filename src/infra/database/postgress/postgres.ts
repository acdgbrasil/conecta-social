import {Pool} from 'pg';
import { CustomError } from '../../error/error.ts';

export const pool = async (numberOfConnection:number = 10) => {
   const pool = new Pool({
    user: process.env.POSTGRES_PROD_USER,       
    host: process.env.POSTGRES_PROD_HOST,      
    database: process.env.POSTGRES_PROD_DB,   
    password: process.env.POSTGRES_PROD_PASSWORD,  
    port: Number(process.env.POSTGRES_PROD_PORT),       
   });
   const pgClient = await pool.connect();
   const queryResult = await pgClient.query('SELECT NOW()');
    if(queryResult.rowCount === 0) {
        throw new CustomError('Database Error', 500, 'Database Error', 'Failed to connect to the database');
    }

    const isConnected = queryResult.rows[0].now ? true : false;

    return { isConnected, pgClient };
}