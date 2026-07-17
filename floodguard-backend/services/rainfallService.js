// services/rainfallService.js
// Free, no key: Open-Meteo Historical Weather API — sum daily rainfall over the past year.

const { getCached, setCached } = require('../utils/cache');

async function getRainfall(lat, lng) {
  const cached = await getCached('rainfall', lat, lng);
  if (cached) return cached.annualRainfall;

  const end = new Date();
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1);
  const fmt = (d) => d.toISOString().split('T')[0];

  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}` +
    `&start_date=${fmt(start)}&end_date=${fmt(end)}&daily=precipitation_sum&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Rainfall lookup failed: ${res.status}`);
  const data = await res.json();

  const total = (data.daily?.precipitation_sum || []).reduce(
    (sum, v) => sum + (v || 0), 0
  );
  const annualRainfall = Math.round(total);

  await setCached('rainfall', lat, lng, { annualRainfall });
  return annualRainfall;
}

module.exports = { getRainfall };