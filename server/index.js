import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'; 
import routes from './routes/index.js';
import pool from './config/database.js';

dotenv.config();

const app = express();

// CORS: allow local dev frontends
const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:5173',
]);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.has(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
}));

app.use(express.json());

// Mount API routes under /api
app.use('/api', routes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});
