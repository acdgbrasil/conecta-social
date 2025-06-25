import { on } from 'events';
import {Pool, PoolClient} from 'pg';
import { CustomError } from '../../error/error';
import { error } from 'console';

export const pool = async (numberOfConnection:number = 10) => {
   const pool = new Pool({connectionString: process.env.DATABASE_URL,max: numberOfConnection});
   const pgClient = await pool.connect();
   const queryResult = await pgClient.query('SELECT NOW()');
    if(queryResult.rowCount === 0) {
        throw new CustomError('Database Error', 500, 'Database Error', 'Failed to connect to the database');
    }

    const isConnected = queryResult.rows[0].now ? true : false;

    return { isConnected, pgClient };
}