// controllers/reportController.js
const pool = require('../db/pool');
const { clusterReports } = require('../services/clusterService');

// User marks "this area has flooded before" — by pin or coordinates.
async function submitReport(req, res) {
  try {
    const { latitude, longitude, addressLabel, severity, eventDate, description } = req.body;
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ error: 'Valid latitude and longitude are required' });
    }
    if (!['Minor', 'Moderate', 'Severe'].includes(severity)) {
      return res.status(400).json({ error: 'Severity must be Minor, Moderate, or Severe' });
    }

    const userId = req.user?.id || null;

    const { rows } = await pool.query(
      `INSERT INTO flood_events
        (latitude, longitude, address_label, source, reported_by, severity, event_date, description)
       VALUES ($1,$2,$3,'community',$4,$5,$6,$7)
       RETURNING *`,
      [lat, lng, addressLabel || null, userId, severity, eventDate || null, description || null]
    );

    res.status(201).json({ report: rows[0] });
  } catch (err) {
    console.error('Report submission failed:', err);
    res.status(500).json({ error: 'Failed to submit report. Please try again.' });
  }
}

// Public — every pin, for the dashboard map layer.
async function listReports(req, res) {
  const { rows } = await pool.query(
    `SELECT id, latitude, longitude, address_label, severity, event_date, description, verified, created_at
     FROM flood_events WHERE source = 'community' ORDER BY created_at DESC`
  );
  res.json({ reports: rows });
}

// Public — clustered into areas, for the dashboard chart.
async function reportStats(req, res) {
  const { rows } = await pool.query(
    `SELECT id, latitude, longitude, address_label, severity, event_date
     FROM flood_events WHERE source = 'community'`
  );
  const areas = clusterReports(rows);
  res.json({ areas });
}

module.exports = { submitReport, listReports, reportStats };