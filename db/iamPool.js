import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

// Read-only pool on the IAM database. See billing/customerLookup.js.
const iamPool = new pg.Pool({
    connectionString: process.env.IAM_DATABASE_URL,
    max: 3,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

export default iamPool;
