// services/floodHistoryService.js
// Reads from the local flood_events table (pre-loaded GDACS/ReliefWeb records +
// community reports) instead of hitting external APIs on every request.
// Turf.js handles the radius search.

// const turf = require('@turf/turf');
// const pool = require('../db/pool');

// async function getFloodHistory(lat, lng, radiusMeters = 500) {
//   // Pull a generous bounding box first (cheap index-friendly query),
//   // then do precise distance filtering with Turf.
//   const degreeBuffer = 0.05; // roughly 5km, generous enough for the radius filter after
//   const { rows } = await pool.query(
//     `SELECT id, latitude, longitude, source, severity, event_date, description
//      FROM flood_events
//      WHERE latitude BETWEEN $1 AND $2 AND longitude BETWEEN $3 AND $4`,
//     [lat - degreeBuffer, lat + degreeBuffer, lng - degreeBuffer, lng + degreeBuffer]
//   );

//   const point = turf.point([lng, lat]);
//   const nearby = rows.filter((event) => {
//     const eventPoint = turf.point([event.longitude, event.latitude]);
//     return turf.distance(point, eventPoint, { units: 'meters' }) <= radiusMeters;
//   });

//   return {
//     historicalFlood: nearby.length > 0,
//     eventCount: nearby.length,
//     events: nearby
//   };
// }

// module.exports = { getFloodHistory };

// services/floodHistoryService.js
const pool = require('../db/pool');

async function getFloodHistory(lat, lng, radiusMeters = 500) {
  const { rows } = await pool.query(
    `SELECT id, latitude, longitude, source, severity, event_date, description
     FROM flood_events
     WHERE ST_DWithin(
       geom,
       ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
       $3
     )`,
    [lng, lat, radiusMeters]
  );

  return {
    historicalFlood: rows.length > 0,
    eventCount: rows.length,
    events: rows
  };
}

module.exports = { getFloodHistory };