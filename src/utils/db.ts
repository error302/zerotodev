import { Pool } from 'pg';

// Use a connection pool to manage database connections efficiently
// Ensure you have a DATABASE_URL environment variable set (e.g. postgres://user:password@localhost:5432/zerotodev)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
};

export const getClient = () => {
  return pool.connect();
};
