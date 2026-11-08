const express = require('express');
const rateLimit = require('express-rate-limit');
const { pool } = require('../db/pool');
const {
  COOKIE_NAME,
  clearSessionCookieOptions,
  createSessionToken,
  hashPassword,
  sessionCookieOptions,
  verifyPassword,
} = require('../auth/credentials');
const { requireAuth } = require('../auth/middleware');
const { validateLogin, validateRegistration } = require('../validation/auth');

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Try again later.' },
});

router.post('/register', authLimiter, async (request, response, next) => {
  const validation = validateRegistration(request.body);
  if (validation.error) return response.status(400).json({ error: validation.error });

  try {
    const { name, email, password } = validation.value;
    const passwordHash = await hashPassword(password);
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash],
    );
    const user = { id: result.insertId, name, email, role: 'user' };
    response.cookie(COOKIE_NAME, createSessionToken(user), sessionCookieOptions());
    return response.status(201).json({ user });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return response.status(409).json({ error: 'An account with this email already exists' });
    }
    return next(error);
  }
});

router.post('/login', authLimiter, async (request, response, next) => {
  const validation = validateLogin(request.body);
  if (validation.error) return response.status(400).json({ error: validation.error });

  try {
    const { email, password } = validation.value;
    const [users] = await pool.execute(
      'SELECT id, name, email, password_hash AS passwordHash, role FROM users WHERE email = ? LIMIT 1',
      [email],
    );
    const user = users[0];
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return response.status(401).json({ error: 'Email or password is incorrect' });
    }

    const publicUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    response.cookie(COOKIE_NAME, createSessionToken(publicUser), sessionCookieOptions());
    return response.json({ user: publicUser });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireAuth, async (request, response, next) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1',
      [request.auth.userId],
    );
    if (!users.length) return response.status(401).json({ error: 'Account no longer exists' });
    return response.json({ user: users[0] });
  } catch (error) {
    return next(error);
  }
});

router.post('/logout', (_request, response) => {
  response.clearCookie(COOKIE_NAME, clearSessionCookieOptions());
  return response.status(204).end();
});

module.exports = router;
