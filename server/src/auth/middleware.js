const { COOKIE_NAME } = require('./credentials');
const jwt = require('jsonwebtoken');

function requireAuth(request, response, next) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    return response.status(503).json({ error: 'Authentication is not configured' });
  }

  const token = request.cookies?.[COOKIE_NAME];
  if (!token) {
    return response.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, secret);
    request.auth = { userId: Number(payload.sub), role: payload.role };
    return next();
  } catch (_error) {
    return response.status(401).json({ error: 'Session is invalid or expired' });
  }
}

function requireAdmin(request, response, next) {
  if (request.auth?.role !== 'admin') {
    return response.status(403).json({ error: 'Administrator access required' });
  }
  return next();
}

module.exports = { requireAdmin, requireAuth };
