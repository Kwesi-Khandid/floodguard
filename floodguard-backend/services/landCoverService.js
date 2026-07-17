// services/landCoverService.js
const { getCached, setCached } = require('../utils/cache');

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

async function getLandCover(lat, lng) {
  const cached = await getCached('landcover', lat, lng);
  if (cached) return cached.landCover;

  const query = `
    [out:json][timeout:20];
    (
      way["landuse"](around:300,${lat},${lng});
      way["natural"~"wetland|water"](around:300,${lat},${lng});
    );
    out tags;
  `;

  let landCover = 'Unknown';
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetchWithTimeout(endpoint, {
        method: 'POST',
        body: query,
        headers: {
          'Content-Type': 'text/plain',
          'User-Agent': 'FloodGuard-App/1.0 (student project, contact: neuenhancedwebtechnologies@gmail.com)'
        }
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();
      const tags = data.elements.map((el) => el.tags?.landuse || el.tags?.natural).filter(Boolean);

      if (tags.some((t) => ['wetland', 'water'].includes(t))) landCover = 'Wetland';
      else if (tags.some((t) => ['residential', 'commercial', 'industrial'].includes(t))) landCover = 'Urban';
      else if (tags.some((t) => ['farmland', 'forest', 'grass', 'meadow'].includes(t))) landCover = 'Vegetated';

      break; // success, stop trying other endpoints
    } catch (err) {
      console.warn(`Land cover lookup failed (${endpoint}):`, err.message);
      // try next endpoint
    }
  }

  await setCached('landcover', lat, lng, { landCover });
  return landCover;
}

module.exports = { getLandCover };