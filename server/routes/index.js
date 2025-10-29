import { Router } from 'express';
import pool from '../config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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

// POST /api/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Find user by email
    const userQuery = `
      SELECT id, email, password_hash, name, role, has_posting_access, created_at, updated_at, last_login
      FROM users 
      WHERE email = $1
    `;

    const userResult = await pool.query(userQuery, [email.toLowerCase()]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const user = userResult.rows[0];

    // Verify password (frontend sends SHA-256 hashed password)
    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-fallback-secret-key',
      { expiresIn: '24h' }
    );

    // Update last_login timestamp
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Return success response
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        hasPostingAccess: user.has_posting_access,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// POST /api/auth/verify (optional - for token verification)
router.post('/auth/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-fallback-secret-key');

    // Get fresh user data
    const userQuery = `
      SELECT id, email, name, role, has_posting_access
      FROM users 
      WHERE id = $1
    `;

    const userResult = await pool.query(userQuery, [decoded.userId]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: 'User not found'
      });
    }

    const user = userResult.rows[0];

    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        hasPostingAccess: user.has_posting_access,
        role: user.role
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Invalid or expired token'
      });
    }

    console.error('Token verification error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

export default router;
