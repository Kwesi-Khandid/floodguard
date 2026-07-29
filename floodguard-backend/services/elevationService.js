

// OPEN METRO Elevation
// services/elevationService.js
// const { getCached, setCached } = require('../utils/cache');

// async function getElevation(lat, lng, attempt = 1) {
//   const cached = await getCached('elevation', lat, lng);
//   if (cached) return cached.elevation;

//   const url = `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`;
//   const res = await fetch(url);

//   if (res.status === 429 && attempt < 3) {
//     await new Promise((r) => setTimeout(r, 1000 * attempt));
//     return getElevation(lat, lng, attempt + 1);
//   }

//   // if (!res.ok) throw new Error(`Elevation lookup failed: ${res.status}`);
//   if (!res.ok) {
//   console.error('Elevation API status:', res.status);
//   console.error(await res.text());
//   throw new Error(`Elevation lookup failed: ${res.status}`);
// }
//   const data = await res.json();
//   const elevation = data.elevation[0];

//   await setCached('elevation', lat, lng, { elevation });
//   return elevation;
// }

// async function getElevationBatch(points, attempt = 1) {
//   const results = new Array(points.length);
//   const uncachedIndexes = [];
//   const uncachedPoints = [];

//   for (let i = 0; i < points.length; i++) {
//     const cached = await getCached('elevation', points[i].lat, points[i].lng);
//     if (cached) {
//       results[i] = cached.elevation;
//     } else {
//       uncachedIndexes.push(i);
//       uncachedPoints.push(points[i]);
//     }
//   }

//   if (uncachedPoints.length > 0) {
//     const lats = uncachedPoints.map((p) => p.lat).join(',');
//     const lngs = uncachedPoints.map((p) => p.lng).join(',');
//     const url = `https://api.open-meteo.com/v1/elevation?latitude=${lats}&longitude=${lngs}`;
//     const res = await fetch(url);

//     if (res.status === 429 && attempt < 3) {
//       await new Promise((r) => setTimeout(r, 1000 * attempt));
//       return getElevationBatch(points, attempt + 1);
//     }

//     if (!res.ok) throw new Error(`Elevation batch lookup failed: ${res.status}`);
//     const data = await res.json();

//     for (let i = 0; i < uncachedPoints.length; i++) {
//       const elevation = data.elevation[i];
//       results[uncachedIndexes[i]] = elevation;
//       await setCached('elevation', uncachedPoints[i].lat, uncachedPoints[i].lng, { elevation });
//     }
//   }

//   return results;
// }

// module.exports = { getElevation, getElevationBatch };

// GOOGLE CLOUD Elevation
// services/elevationService.js
const { getCached, setCached } = require('../utils/cache');

async function getElevation(lat, lng) {
  const cached = await getCached('elevation', lat, lng);
  if (cached) return cached.elevation;

  const url = `https://maps.googleapis.com/maps/api/elevation/json?locations=${lat},${lng}&key=${process.env.GOOGLE_ELEVATION_API}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Elevation lookup failed: ${res.status}`);

  const data = await res.json();
  if (data.status !== 'OK') throw new Error(`Elevation lookup failed: ${data.status}`);

  const elevation = data.results[0].elevation;

  await setCached('elevation', lat, lng, { elevation });
  return elevation;
}

// Fetches elevation for multiple points in ONE request instead of one-per-point.
// Google's API accepts pipe-separated lat,lng pairs.
async function getElevationBatch(points) {
  const results = new Array(points.length);
  const uncachedIndexes = [];
  const uncachedPoints = [];

  for (let i = 0; i < points.length; i++) {
    const cached = await getCached('elevation', points[i].lat, points[i].lng);
    if (cached) {
      results[i] = cached.elevation;
    } else {
      uncachedIndexes.push(i);
      uncachedPoints.push(points[i]);
    }
  }

  if (uncachedPoints.length > 0) {
    const locations = uncachedPoints.map((p) => `${p.lat},${p.lng}`).join('|');
    const url = `https://maps.googleapis.com/maps/api/elevation/json?locations=${locations}&key=${process.env.GOOGLE_ELEVATION_API}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Elevation batch lookup failed: ${res.status}`);

    const data = await res.json();
    if (data.status !== 'OK') throw new Error(`Elevation batch lookup failed: ${data.status}`);

    for (let i = 0; i < uncachedPoints.length; i++) {
      const elevation = data.results[i].elevation;
      results[uncachedIndexes[i]] = elevation;
      await setCached('elevation', uncachedPoints[i].lat, uncachedPoints[i].lng, { elevation });
    }
  }

  return results;
}

module.exports = { getElevation, getElevationBatch };