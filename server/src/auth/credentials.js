const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'seenit_session';
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

function getJwtSecret() {
  return process.env.JWT_SECRET;
}

function createSessionToken(user) {
  const secret = getJwtSecret();
  if (!secret || secret.length < 32) {
    const error = new Error('Authentication is not configured. Set JWT_SECRET to at least 32 characters.');
    error.status = 503;
    throw error;
  }
  return jwt.sign({ sub: String(user.id), role: user.role }, secret, { expiresIn: '8h' });
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_MS,
    path: '/',
  };
}

function clearSessionCookieOptions() {
  const { maxAge: _maxAge, ...options } = sessionCookieOptions();
  return options;
}

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

module.exports = {
  COOKIE_NAME,
  SESSION_DURATION_MS,
  clearSessionCookieOptions,
  createSessionToken,
  hashPassword,
  sessionCookieOptions,
  verifyPassword,
};
