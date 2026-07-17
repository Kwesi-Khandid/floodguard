// services/waterwayService.js
// Free: Overpass API (OpenStreetMap) for waterway geometry,
// Turf.js for accurate point-to-line distance.

const turf = require('@turf/turf');
const { getCached, setCached } = require('../utils/cache');

// Public Overpass instances are shared/free and occasionally overloaded (504s).
// Try the primary, fall back to a mirror if it times out or errors.
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];

async function fetchWithTimeout(url, options, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWaterways(lat, lng, radiusMeters = 2000) {
  const query = `
    [out:json][timeout:20];
    (
      way["waterway"~"river|stream|drain|canal"](around:${radiusMeters},${lat},${lng});
    );
    out geom;
  `;

  let lastError;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetchWithTimeout(endpoint, {
        method: 'POST',
        body: query,
        headers: {
          'Content-Type': 'text/plain',
          'User-Agent': 'FloodGuard-App/1.0 (student project, neuenhancedwebtechnologies@gmail.com)'
        }
      });
      if (!res.ok) throw new Error(`Overpass waterway lookup failed: ${res.status}`);
      const data = await res.json();

      return data.elements
        .filter((el) => el.type === 'way' && el.geometry)
        .map((el) => ({
          coordinates: el.geometry.map((pt) => [pt.lon, pt.lat]),
          tags: el.tags || {}
        }));
    } catch (err) {
      lastError = err;
      console.warn(`Overpass endpoint failed (${endpoint}):`, err.message);
      // try next endpoint
    }
  }
  throw lastError;
}

function findNearestWaterway(userLat, userLng, ways) {
  const point = turf.point([userLng, userLat]);
  let nearest = null;

  for (const way of ways) {
    if (way.coordinates.length < 2) continue;
    const line = turf.lineString(way.coordinates);
    const dist = turf.pointToLineDistance(point, line, { units: 'meters' });
    if (!nearest || dist < nearest.distance) {
      nearest = { distance: Math.round(dist), type: way.tags.waterway || 'unknown' };
    }
  }

  return nearest || { distance: null, type: null };
}

async function getNearestWaterway(lat, lng) {
  const cached = await getCached('waterway', lat, lng);
  if (cached) return cached;

  try {
    const ways = await fetchWaterways(lat, lng);
    const result = findNearestWaterway(lat, lng, ways);
    await setCached('waterway', lat, lng, result);
    return result;
  } catch (err) {
    console.warn('Waterway lookup failed on all endpoints, defaulting to unknown:', err.message);
    return { distance: null, type: null }; // graceful fallback, doesn't break the whole check
  }
}

module.exports = { getNearestWaterway, findNearestWaterway, fetchWaterways };