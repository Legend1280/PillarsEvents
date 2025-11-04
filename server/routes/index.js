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

// POST /api/auth/logout - accepts a token and responds with success
router.post('/auth/logout', async (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Optional: verify format; in stateless JWT flow we don't need to revoke here
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'your-fallback-secret-key');
    } catch (_) {
      // Even if token is invalid/expired, we can still return success to allow client logout
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// MIDDLEWARE - Authentication
// ============================================
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Authorization token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-fallback-secret-key');

    // Fetch user details to check permissions
    const userQuery = 'SELECT id, email, role, has_posting_access FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [decoded.userId]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user to request object
    req.user = userResult.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ============================================
// MIDDLEWARE - Check Posting Access
// ============================================
const checkPostingAccess = (req, res, next) => {
  if (!req.user.has_posting_access) {
    return res.status(403).json({
      error: 'Access denied. You do not have posting permissions.'
    });
  }
  next();
};

// ============================================
// MIDDLEWARE - Check Admin Role
// ============================================
const checkAdminRole = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// ============================================
// VALIDATION - Event Input
// ============================================
const validateEventInput = (req, res, next) => {
  const { title, date, time, description, host, location, department, tags, status } = req.body;
  const errors = [];

  // Required fields validation
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string');
  }
  if (!date || isNaN(Date.parse(date))) {
    errors.push('Date is required and must be a valid ISO date string');
  }
  if (!time || typeof time !== 'string') {
    errors.push('Time is required and must be a string (e.g., "10:00 AM")');
  }
  if (!host || typeof host !== 'string') {
    errors.push('Host is required');
  }
  if (!location || typeof location !== 'string') {
    errors.push('Location is required');
  }
  if (!department || typeof department !== 'string') {
    errors.push('Department is required');
  }

  // Optional fields validation (only validate if provided)
  if (description !== undefined && typeof description !== 'string') {
    errors.push('Description must be a string');
  }

  // Tags validation (optional, but if provided must be an array)
  if (tags !== undefined && !Array.isArray(tags)) {
    errors.push('Tags must be an array');
  }

  // Status validation
  if (!status || !['published', 'draft'].includes(status)) {
    errors.push('Status must be either "published" or "draft"');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  // Set defaults for optional fields
  if (!description) {
    req.body.description = '';
  }
  if (!tags || !Array.isArray(tags)) {
    req.body.tags = [];
  }

  next();
};

// ============================================
// GET /api/events - Get all events with filters
// ============================================
router.get('/events', async (req, res) => {
  try {
    const { month, year, department, status, page = 1, limit = 50 } = req.query;

    // Build WHERE clause
    let whereClause = 'WHERE 1=1';
    const queryParams = [];
    let paramCount = 1;

    // Filter by month and year
    if (month && year) {
      whereClause += ` AND EXTRACT(MONTH FROM date) = $${paramCount} AND EXTRACT(YEAR FROM date) = $${paramCount + 1}`;
      queryParams.push(parseInt(month), parseInt(year));
      paramCount += 2;
    } else if (year) {
      whereClause += ` AND EXTRACT(YEAR FROM date) = $${paramCount}`;
      queryParams.push(parseInt(year));
      paramCount += 1;
    }

    // Filter by department
    if (department) {
      whereClause += ` AND department = $${paramCount}`;
      queryParams.push(department);
      paramCount += 1;
    }

    // Filter by status
    if (status && ['published', 'draft'].includes(status)) {
      whereClause += ` AND status = $${paramCount}`;
      queryParams.push(status);
      paramCount += 1;
    }

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) FROM events ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Build main query
    const queryText = `
      SELECT 
        id, title, 
        TO_CHAR(date, 'YYYY-MM-DD') as date,
        time, description, host, location, 
        department, tags, status, image_url as "imageUrl", 
        created_by as "createdBy", created_at as "createdAt", 
        updated_at as "updatedAt"
      FROM events
      ${whereClause}
      ORDER BY date DESC, created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    queryParams.push(limitNum, offset);

    // Execute main query
    const result = await pool.query(queryText, queryParams);

    return res.status(200).json({
      events: result.rows,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// GET /api/events/:id - Get single event
// ============================================
router.get('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const queryText = `
      SELECT 
        id, title, 
        TO_CHAR(date, 'YYYY-MM-DD') as date,
        time, description, host, location, 
        department, tags, status, image_url as "imageUrl", 
        created_by as "createdBy", created_at as "createdAt", 
        updated_at as "updatedAt"
      FROM events 
      WHERE id = $1
    `;

    const result = await pool.query(queryText, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.status(200).json({ event: result.rows[0] });

  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// POST /api/events - Create new event
// ============================================
router.post('/events', authenticateToken, checkPostingAccess, validateEventInput, async (req, res) => {
  try {
    const { title, date, time, description, host, location, department, tags, status, imageUrl } = req.body;
    const userId = req.user.id;

    const queryText = `
      INSERT INTO events (
        title, date, time, description, host, location, 
        department, tags, status, image_url, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11)
      RETURNING 
        id, title, 
        TO_CHAR(date, 'YYYY-MM-DD') as date,
        time, description, host, location, 
        department, tags, status, image_url as "imageUrl", 
        created_by as "createdBy", created_at as "createdAt", 
        updated_at as "updatedAt"
    `;

    const values = [
      title.trim(),
      date,
      time,
      description ? description.trim() : '',
      host.trim(),
      location.trim(),
      department,
      JSON.stringify(Array.isArray(tags) ? tags : []),
      status,
      imageUrl || null,
      userId
    ];

    const result = await pool.query(queryText, values);

    res.status(201).json({
      event: result.rows[0],
      message: 'Event created successfully'
    });

  } catch (error) {
    console.error('Create event error:', error);

    // Handle unique constraint violations
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Event with this data already exists' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// PUT /api/events/:id - Update event
// ============================================
router.put('/events/:id', authenticateToken, checkPostingAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, time, description, host, location, department, tags, status, imageUrl } = req.body;

    // First, check if event exists
    const checkQuery = 'SELECT id, created_by FROM events WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount}`);
      values.push(title.trim());
      paramCount++;
    }
    if (date !== undefined) {
      if (isNaN(Date.parse(date))) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
      updates.push(`date = $${paramCount}`);
      values.push(date);
      paramCount++;
    }
    if (time !== undefined) {
      updates.push(`time = $${paramCount}`);
      values.push(time);
      paramCount++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(typeof description === 'string' ? description.trim() : '');
      paramCount++;
    }
    if (host !== undefined) {
      updates.push(`host = $${paramCount}`);
      values.push(host.trim());
      paramCount++;
    }
    if (location !== undefined) {
      updates.push(`location = $${paramCount}`);
      values.push(location.trim());
      paramCount++;
    }
    if (department !== undefined) {
      updates.push(`department = $${paramCount}`);
      values.push(department);
      paramCount++;
    }
    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        return res.status(400).json({ error: 'Tags must be an array' });
      }
      updates.push(`tags = $${paramCount}::jsonb`);
      values.push(JSON.stringify(tags));
      paramCount++;
    }
    if (status !== undefined) {
      if (!['published', 'draft'].includes(status)) {
        return res.status(400).json({ error: 'Status must be "published" or "draft"' });
      }
      updates.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }
    if (imageUrl !== undefined) {
      updates.push(`image_url = $${paramCount}`);
      values.push(imageUrl || null);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Add updated_at timestamp
    updates.push(`updated_at = NOW()`);

    // Add the id parameter
    values.push(id);

    const queryText = `
      UPDATE events 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING 
        id, title, 
        TO_CHAR(date, 'YYYY-MM-DD') as date,
        time, description, host, location, 
        department, tags, status, image_url as "imageUrl", 
        created_by as "createdBy", created_at as "createdAt", 
        updated_at as "updatedAt"
    `;

    const result = await pool.query(queryText, values);

    return res.status(200).json({
      event: result.rows[0],
      message: 'Event updated successfully'
    });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// DELETE /api/events/:id - Delete event
// ============================================
router.delete('/events/:id', authenticateToken, checkPostingAccess, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if event exists
    const checkQuery = 'SELECT id FROM events WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Delete the event
    const deleteQuery = 'DELETE FROM events WHERE id = $1';
    await pool.query(deleteQuery, [id]);

    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// POST /api/permissions/request-access - Request posting access
// ============================================
router.post('/permissions/request-access', authenticateToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const userId = req.user.id;

    // Check if user already has posting access
    if (req.user.has_posting_access) {
      return res.status(400).json({ error: 'You already have posting access' });
    }

    // Check if there's already a pending request for this user
    const existingRequest = await pool.query(
      'SELECT id, status FROM access_requests WHERE user_id = $1 AND status = $2',
      [userId, 'pending']
    );

    if (existingRequest.rows.length > 0) {
      return res.status(400).json({ 
        error: 'You already have a pending access request',
        requestId: existingRequest.rows[0].id
      });
    }

    // Create new access request
    const queryText = `
      INSERT INTO access_requests (user_id, reason, status)
      VALUES ($1, $2, 'pending')
      RETURNING id, user_id as "userId", reason, status, created_at as "createdAt"
    `;

    const result = await pool.query(queryText, [userId, reason || '']);

    return res.status(201).json({
      requestId: result.rows[0].id,
      status: result.rows[0].status,
      message: 'Access request submitted successfully'
    });

  } catch (error) {
    console.error('Request access error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// GET /api/permissions/requests - Get all access requests (Admin only)
// ============================================
router.get('/permissions/requests', authenticateToken, checkAdminRole, async (req, res) => {
  try {
    const { status } = req.query;

    let whereClause = '';
    const queryParams = [];

    // Filter by status if provided
    if (status && ['pending', 'approved', 'denied'].includes(status)) {
      whereClause = 'WHERE ar.status = $1';
      queryParams.push(status);
    }

    const queryText = `
      SELECT 
        ar.id,
        ar.user_id as "userId",
        u.name as "userName",
        u.email as "userEmail",
        ar.reason,
        ar.status,
        ar.created_at as "createdAt"
      FROM access_requests ar
      JOIN users u ON ar.user_id = u.id
      ${whereClause}
      ORDER BY 
        CASE ar.status 
          WHEN 'pending' THEN 1 
          WHEN 'approved' THEN 2 
          WHEN 'denied' THEN 3 
        END,
        ar.created_at DESC
    `;

    const result = await pool.query(queryText, queryParams);

    return res.status(200).json({
      requests: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// POST /api/permissions/approve/:requestId - Approve access request (Admin only)
// ============================================
router.post('/permissions/approve/:requestId', authenticateToken, checkAdminRole, async (req, res) => {
  try {
    const { requestId } = req.params;

    // Check if request exists and is pending
    const requestQuery = 'SELECT id, user_id, status FROM access_requests WHERE id = $1';
    const requestResult = await pool.query(requestQuery, [requestId]);

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ error: 'Access request not found' });
    }

    const request = requestResult.rows[0];

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        error: `Request already ${request.status}`,
        currentStatus: request.status
      });
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update request status
      await client.query(
        'UPDATE access_requests SET status = $1 WHERE id = $2',
        ['approved', requestId]
      );

      // Grant posting access to user
      await client.query(
        'UPDATE users SET has_posting_access = true, updated_at = NOW() WHERE id = $1',
        [request.user_id]
      );

      await client.query('COMMIT');

      // Fetch updated user
      const userQuery = `
        SELECT id, email, name, role, has_posting_access as "hasPostingAccess"
        FROM users WHERE id = $1
      `;
      const userResult = await client.query(userQuery, [request.user_id]);

      return res.status(200).json({
        success: true,
        message: 'Access request approved',
        user: userResult.rows[0]
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// POST /api/permissions/deny/:requestId - Deny access request (Admin only)
// ============================================
router.post('/permissions/deny/:requestId', authenticateToken, checkAdminRole, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;

    // Check if request exists and is pending
    const requestQuery = 'SELECT id, user_id, status FROM access_requests WHERE id = $1';
    const requestResult = await pool.query(requestQuery, [requestId]);

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ error: 'Access request not found' });
    }

    const request = requestResult.rows[0];

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        error: `Request already ${request.status}`,
        currentStatus: request.status
      });
    }

    // Update request status
    const updateQuery = `
      UPDATE access_requests 
      SET status = 'denied'
      WHERE id = $1
      RETURNING id, user_id as "userId", status
    `;

    const result = await pool.query(updateQuery, [requestId]);

    return res.status(200).json({
      success: true,
      message: 'Access request denied',
      request: result.rows[0],
      denialReason: reason
    });

  } catch (error) {
    console.error('Deny request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
