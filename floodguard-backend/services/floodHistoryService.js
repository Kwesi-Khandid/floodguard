// services/floodHistoryService.js
// Reads from the local flood_events table (pre-loaded GDACS/ReliefWeb records +
// community reports) instead of hitting external APIs on every request.
// Turf.js handles the radius search.

// services/floodHistoryService.js

const pool = require('../db/pool');

async function getFloodHistory(lat, lng, radiusMeters = 500) {
  try {
    // $1 = lng, $2 = lat, $3 = radius in meters
    const { rows } = await pool.query(
      `SELECT id, source, severity, event_date, description
       FROM flood_events
       WHERE ST_DWithin(
         geom,
         ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
         $3
       );`,
      [lng, lat, radiusMeters]
    );

    return {
      historicalFlood: rows.length > 0,
      eventCount: rows.length,
      events: rows
    };
  } catch (err) {
    console.error('PostGIS Flood History query error:', err.message);
    return {
      historicalFlood: false,
      eventCount: 0,
      events: []
    };
  }
}

module.exports = { getFloodHistory };
