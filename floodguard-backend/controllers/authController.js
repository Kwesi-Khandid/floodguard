// controllers/authController.js
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const JWT_SECRET = process.env.JWT_SECRET
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function findUserByGoogleId(googleId) {
  const { rows } = await pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
  return rows[0] || null;
}

async function createUser({ google_id, email, full_name, avatar_url }) {
  const { rows } = await pool.query(
    `INSERT INTO users (google_id, email, full_name, avatar_url)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [google_id, email, full_name, avatar_url]
  );
  return rows[0];
}

async function googleLogin(req, res) {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Missing Google credential' });

    const ticket = await client.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();

    let user = await findUserByGoogleId(payload.sub);
    if (!user) {
      user = await createUser({
        google_id: payload.sub,
        email: payload.email,
        full_name: payload.name,
        avatar_url: payload.picture
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ user: { id: user.id, full_name: user.full_name, email: user.email, avatar_url: user.avatar_url } });
  } catch (err) {
    console.error('Google login failed:', err);
    res.status(401).json({ error: 'Google sign-in failed' });
  }
}

function logout(req, res) {
  res.clearCookie('token');
  res.json({ success: true });
}

async function me(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Not logged in' });
  const { rows } = await pool.query('SELECT id, full_name, email, avatar_url, role FROM users WHERE id = $1', [req.user.id]);
  res.json({ user: rows[0] || null });
}

module.exports = { googleLogin, logout, me, findUserByGoogleId, createUser };