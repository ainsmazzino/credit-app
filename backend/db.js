// db.js — connects to PostgreSQL (Neon) and creates the tables on first run.
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// One shared connection pool for the whole app.
// ssl is required by Neon (and by Render's own Postgres too).
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Runs once when the server boots. "IF NOT EXISTS" means it is safe
// to run every time — it only creates the tables the first time.
export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id          SERIAL PRIMARY KEY,
      full_name   TEXT NOT NULL,
      mobile      TEXT NOT NULL UNIQUE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id           SERIAL PRIMARY KEY,
      customer_id  INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      type         TEXT NOT NULL CHECK (type IN ('credit', 'payment')),
      amount       NUMERIC(12,2) NOT NULL CHECK (amount > 0),
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  console.log('Database tables are ready.');
}
