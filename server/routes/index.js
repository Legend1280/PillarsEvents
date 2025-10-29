import { Router } from 'express';
import pool from '../config/database.js';

const router = Router();

router.get('/hello', (_req, res) => {
  res.json({ message: 'Backend is running successfully!' });
});

router.get('/test-db', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Connected to DB', time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

export default router;
