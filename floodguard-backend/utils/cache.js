// utils/cache.js
// Thin helper around the gis_cache table used by all data-collector services.

const pool = require('../db/pool');

const TTL_DAYS = {
  elevation: 30,
  waterway: 30,
  slope: 30,
  soil: 60,
  landcover: 60,
  rainfall: 7
};

function roundCoord(value) {
  // ~100m grid — fine enough to reuse results for nearby lookups
  return Math.round(value * 1000) / 1000;
}

async function getCached(dataType, lat, lng) {
  const latR = roundCoord(lat);
  const lngR = roundCoord(lng);

  const { rows } = await pool.query(
    `SELECT payload FROM gis_cache
     WHERE data_type = $1 AND lat_rounded = $2 AND lng_rounded = $3 AND expires_at > NOW()`,
    [dataType, latR, lngR]
  );

  return rows.length ? rows[0].payload : null;
}

async function setCached(dataType, lat, lng, payload) {
  const latR = roundCoord(lat);
  const lngR = roundCoord(lng);
  const ttlDays = TTL_DAYS[dataType] || 14;

  await pool.query(
    `INSERT INTO gis_cache (data_type, lat_rounded, lng_rounded, payload, expires_at)
     VALUES ($1, $2, $3, $4, NOW() + ($5 || ' days')::interval)
     ON CONFLICT (data_type, lat_rounded, lng_rounded)
     DO UPDATE SET payload = $4, fetched_at = NOW(), expires_at = NOW() + ($5 || ' days')::interval`,
    [dataType, latR, lngR, JSON.stringify(payload), ttlDays]
  );
}

module.exports = { getCached, setCached };