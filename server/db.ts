import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

export const pool = new Pool({
    // When running locally alongside docker, use localhost. Inside docker network, use 'db'
    connectionString: process.env.DATABASE_URL || 'postgres://vmc_user:vmc_password@localhost:5432/vmc_database',
});

export const query = (text: string, params?: any[]) => {
    return pool.query(text, params);
};
