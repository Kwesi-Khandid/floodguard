// // services/elevationService.js
// const { getCached, setCached } = require('../utils/cache');

// async function getElevation(lat, lng) {
//   const cached = await getCached('elevation', lat, lng);
//   if (cached) return cached.elevation;

//   const url = `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`;
//   const res = await fetch(url);
//   if (!res.ok) throw new Error(`Elevation lookup failed: ${res.status}`);
//   const data = await res.json();
//   const elevation = data.elevation[0];

//   await setCached('elevation', lat, lng, { elevation });
//   return elevation;
// }

// // Fetches elevation for multiple points in ONE request instead of one-per-point.
// // Cached points are skipped; only uncached points go into the batch call.
// async function getElevationBatch(points) {
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





// CORRECTION
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

//   if (!res.ok) throw new Error(`Elevation lookup failed: ${res.status}`);
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


//GPT CORRECTION
const { getCached, setCached } = require('../utils/cache');

// Round coordinates for caching only (about 100m precision)
function cacheCoords(lat, lng) {
  return {
    lat: Number(lat).toFixed(3),
    lng: Number(lng).toFixed(3)
  };
}

async function getElevation(lat, lng, attempt = 1) {
  const key = cacheCoords(lat, lng);

  const cached = await getCached('elevation', key.lat, key.lng);
  if (cached) return cached.elevation;

  const url = `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`;
  const res = await fetch(url);

  if (res.status === 429 && attempt < 3) {
    console.warn(`Elevation API rate limited. Retry ${attempt}...`);
    await new Promise(resolve => setTimeout(resolve, attempt * 1500));
    return getElevation(lat, lng, attempt + 1);
  }

  if (!res.ok) {
    throw new Error(`Elevation lookup failed: ${res.status}`);
  }

  const data = await res.json();
  const elevation = data.elevation[0];

  await setCached('elevation', key.lat, key.lng, { elevation });

  return elevation;
}

async function getElevationBatch(points, attempt = 1) {
  const results = new Array(points.length);

  const uncachedPoints = [];
  const uncachedIndexes = [];
  const cacheKeys = [];

  for (let i = 0; i < points.length; i++) {
    const key = cacheCoords(points[i].lat, points[i].lng);
    cacheKeys.push(key);

    const cached = await getCached('elevation', key.lat, key.lng);

    if (cached) {
      results[i] = cached.elevation;
    } else {
      uncachedIndexes.push(i);
      uncachedPoints.push(points[i]);
    }
  }

  if (uncachedPoints.length) {
    const lats = uncachedPoints.map(p => p.lat).join(',');
    const lngs = uncachedPoints.map(p => p.lng).join(',');

    const url = `https://api.open-meteo.com/v1/elevation?latitude=${lats}&longitude=${lngs}`;
    const res = await fetch(url);

    if (res.status === 429 && attempt < 3) {
      console.warn(`Elevation batch rate limited. Retry ${attempt}...`);
      await new Promise(resolve => setTimeout(resolve, attempt * 1500));
      return getElevationBatch(points, attempt + 1);
    }

    if (!res.ok) {
      throw new Error(`Elevation batch lookup failed: ${res.status}`);
    }

    const data = await res.json();

    for (let i = 0; i < uncachedPoints.length; i++) {
      const elevation = data.elevation[i];
      const index = uncachedIndexes[i];
      const key = cacheKeys[index];

      results[index] = elevation;

      await setCached('elevation', key.lat, key.lng, { elevation });
    }
  }

  return results;
}

module.exports = {
  getElevation,
  getElevationBatch
};