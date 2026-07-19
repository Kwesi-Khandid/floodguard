// services/elevationService.js
const { getCached, setCached } = require('../utils/cache');

async function getElevation(lat, lng, attempt = 1) {
  const cached = await getCached('elevation', lat, lng);
  if (cached) return cached.elevation;

  const url = `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`;
  const res = await fetch(url);

  if (res.status === 429 && attempt < 3) {
    await new Promise((r) => setTimeout(r, 1000 * attempt)); // 1s, then 2s backoff
    return getElevation(lat, lng, attempt + 1);
  }

  if (!res.ok) throw new Error(`Elevation lookup failed: ${res.status}`);
  const data = await res.json();
  const elevation = data.elevation[0];

  await setCached('elevation', lat, lng, { elevation });
  return elevation;
}

module.exports = { getElevation };