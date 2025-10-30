import { Router } from 'express';
import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
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
    console.log('===============================');
    console.log('Plain Password (from frontend):', password);
    console.log('Stored Hash (from DB):', user.password_hash);
    console.log('===============================');

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    console.log('✅ Password matched successfully!');

    // Generate access token (24h)
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-fallback-secret-key',
      { expiresIn: '24h' }
    );

    // Generate refresh token (e.g., 7 days)
    const refreshToken = jwt.sign(
      {
        userId: user.id,
        tokenType: 'refresh'
      },
      process.env.REFRESH_JWT_SECRET || process.env.JWT_SECRET || 'your-fallback-secret-key',
      { expiresIn: '7d' }
    );

    // Update last_login timestamp
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Return success response
    res.json({
      token,
      refreshToken,
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

// GET /api/auth/me - returns current user based on Bearer token
router.get('/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'] || '';
    const [, token] = authHeader.split(' '); // Expect "Bearer <token>"

    if (!token) {
      return res.status(401).json({ error: 'Authorization token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-fallback-secret-key');

    const userQuery = `
      SELECT id, email, name, role, has_posting_access
      FROM users 
      WHERE id = $1
    `;
    const userResult = await pool.query(userQuery, [decoded.userId]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      hasPostingAccess: user.has_posting_access,
      role: user.role,
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    console.error('Auth me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/refresh - issues a new access token given a valid refresh token
router.post('/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_JWT_SECRET || process.env.JWT_SECRET || 'your-fallback-secret-key'
    );

    if (decoded.tokenType !== 'refresh') {
      return res.status(400).json({ error: 'Invalid token type' });
    }

    // Optionally: check user still exists
    const userQuery = `
      SELECT id, email, role FROM users WHERE id = $1
    `;
    const userResult = await pool.query(userQuery, [decoded.userId]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    const user = userResult.rows[0];

    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-fallback-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ token: newAccessToken });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/auth/hash', async (req, res) => {
  try {
    const { password } = req.body; // expect plain password
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log('===============================');
    console.log('Plain Password:', password);
    console.log('Generated Bcrypt Hash:', hashedPassword);
    console.log('===============================');

    // Return the hash so you can copy it and update DB via psql or admin UI
    res.json({
      password,
      hashedPassword,
      note: 'Copy this hashedPassword and store it in users.password_hash in PostgreSQL.'
    });
  } catch (error) {
    console.error('Error generating hash:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
