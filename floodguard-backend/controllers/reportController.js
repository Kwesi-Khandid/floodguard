// controllers/reportController.js
const pool = require('../db/pool');

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
    (latitude, longitude, geom, geohash, address_label, source, reported_by, severity, event_date, description)
   VALUES (
     $1::float8, $2::float8,
     ST_SetSRID(ST_MakePoint($2::float8, $1::float8), 4326)::geography,
     ST_GeoHash(ST_SetSRID(ST_MakePoint($2::float8, $1::float8), 4326), 9),
     $3, 'community', $4, $5, $6, $7
   )
   RETURNING *`,
  [lat, lng, addressLabel || null, userId, severity, eventDate || null, description || null]
);

    res.status(201).json({ report: rows[0] });
  } catch (err) {
    console.error('Report submission failed:', err);
    res.status(500).json({ error: 'Failed to submit report. Please try again.' });
  }
}

async function listReports(req, res) {
  const { rows } = await pool.query(
    `SELECT id, latitude, longitude, address_label, severity, event_date, description, verified, created_at
     FROM flood_events WHERE source = 'community' ORDER BY created_at DESC`
  );
  res.json({ reports: rows });
}

// Valid geohash precision range for this use case:
// 4 ≈ ~20km x 20km cells (regional/national zoom)
// 5 ≈ ~5km x 5km
// 6 ≈ ~1.2km x 0.6km (default — city-block scale)
// 7 ≈ ~150m x 150m
// 8 ≈ ~40m x 20m (near-exact, borderline useless for aggregation)
const MIN_PRECISION = 4;
const MAX_PRECISION = 8;
const DEFAULT_PRECISION = 6;

function parsePrecision(value) {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return DEFAULT_PRECISION;
  return Math.min(MAX_PRECISION, Math.max(MIN_PRECISION, n));
}

async function reportStats(req, res) {
  const precision = parsePrecision(req.query.precision);

  const { rows } = await pool.query(
    `SELECT
       LEFT(geohash, $1) AS area_hash,
       COUNT(*)::int AS report_count,
       MODE() WITHIN GROUP (ORDER BY severity) AS most_common_severity,
       MAX(CASE WHEN severity = 'Severe' THEN 1 ELSE 0 END) AS has_severe,
       ST_Y(ST_Centroid(ST_Collect(geom::geometry))) AS centroid_lat,
       ST_X(ST_Centroid(ST_Collect(geom::geometry))) AS centroid_lng,
       (ARRAY_AGG(address_label ORDER BY created_at DESC))[1] AS area_label,
       MAX(event_date) AS last_reported
     FROM flood_events
     WHERE source = 'community' AND geohash IS NOT NULL
     GROUP BY area_hash
     ORDER BY report_count DESC`,
    [precision]
  );

  const areas = rows.map((r) => ({
    latitude: r.centroid_lat,
    longitude: r.centroid_lng,
    areaLabel: r.area_label || 'Unnamed area',
    reportCount: r.report_count,
    mostSevereRating: r.has_severe ? 'Severe' : r.most_common_severity,
    lastReported: r.last_reported
  }));

  res.json({ areas, precision });
}

module.exports = { submitReport, listReports, reportStats };