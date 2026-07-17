// routes/history.js
const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT * FROM risk_assessments WHERE user_id = $1 ORDER BY created_at DESC`,
    [req.user.id]
  );
  res.json({ assessments: rows });
});

router.delete('/:id', requireAuth, async (req, res) => {
  await pool.query(
    `DELETE FROM risk_assessments WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.user.id]
  );
  res.json({ success: true });
});

module.exports = router;