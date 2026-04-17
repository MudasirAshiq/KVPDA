
import { Pool } from '@neondatabase/serverless';

const env = (import.meta as any).env || {};
// Removed channel_binding=require as it often causes issues in browser environments
const connectionString = env.VITE_DATABASE_URL || 'postgresql://neondb_owner:npg_SaeiKr96ocnE@ep-dawn-heart-ah04qmia-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

let pool: Pool | null = null;

if (connectionString) {
  try {
    pool = new Pool({ connectionString });
  } catch (e) {
    console.error("Failed to initialize Neon Pool", e);
  }
} else {
  console.error("VITE_DATABASE_URL is missing in environment variables.");
}

// Helper to execute query
export const sql = async (text: string, params: any[] = []) => {
  if (!pool) throw new Error("Database connection not initialized. Missing VITE_DATABASE_URL.");
  
  // We use a new client for each request in this simple setup, 
  // though Pool handles connections efficiently in serverless envs.
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } catch (err) {
    console.error("SQL Error:", err);
    throw err;
  } finally {
    // Important to release the client back to the pool
    // @ts-ignore
    if (client && typeof client.release === 'function') {
        client.release();
    }
  }
};

// Helper for single row return
export const sqlSingle = async (text: string, params: any[] = []) => {
    const rows = await sql(text, params);
    return rows.length > 0 ? rows[0] : null;
};