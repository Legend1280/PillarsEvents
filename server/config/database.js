import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import pkg from 'pg';

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load .env from the server folder explicitly
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('🔍 DATABASE_URL =', process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return error after 10 seconds if connection could not be established
});

// Handle pool errors (important for Neon.tech which auto-closes idle connections)
pool.on('error', (err, client) => {
  console.error('❌ Unexpected error on idle client:', err.message);
  // Connection will be automatically recreated on next query
});

// Test initial connection
pool.connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL successfully!');
    client.release();
  })
  .catch(err => console.error('❌ PostgreSQL connection error:', err.message));

export default pool;
