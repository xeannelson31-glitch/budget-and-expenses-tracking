import { Pool } from 'pg';

// Setup postgres connection pool using node-postgres
// This is used for backend operations (Server Actions, API Routes)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
};
