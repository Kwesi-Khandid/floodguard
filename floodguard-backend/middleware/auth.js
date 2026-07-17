// middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_JWT_SECRET';

// Attaches req.user if a valid token cookie is present, but never blocks the request.
// Use this on routes where guests are allowed (e.g. flood-risk checks).
function attachUserIfPresent(req, res, next) {
  const token = req.cookies?.token;
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      req.user = null;
    }
  }
  next();
}

// Blocks the request unless a valid token is present.
// Use this on routes that require login (e.g. history, saved locations).
function requireAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Login required' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

module.exports = { attachUserIfPresent, requireAuth };