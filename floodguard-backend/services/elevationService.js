// services/elevationService.js
// Free, no API key: Open-Meteo Elevation API

const { getCached, setCached } = require('../utils/cache');

async function getElevation(lat, lng) {
  const cached = await getCached('elevation', lat, lng);
  if (cached) return cached.elevation;

  const url = `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Elevation lookup failed: ${res.status}`);
  const data = await res.json();
  const elevation = data.elevation[0];

  await setCached('elevation', lat, lng, { elevation });
  return elevation;
}

module.exports = { getElevation };