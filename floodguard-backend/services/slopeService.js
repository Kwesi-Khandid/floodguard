// // services/slopeService.js
// const turf = require('@turf/turf');
// const { getElevationBatch } = require('./elevationService');

// async function getSlope(lat, lng) {
//   const center = turf.point([lng, lat]);
//   const bearings = [0, 90, 180, 270];
//   const distanceKm = 0.1;

//   const samplePoints = bearings.map((b) => turf.destination(center, distanceKm, b));

//   const points = [
//     { lat, lng },
//     ...samplePoints.map((p) => ({ lat: p.geometry.coordinates[1], lng: p.geometry.coordinates[0] }))
//   ];

//   const elevations = await getElevationBatch(points); // ONE request for all 5 points
//   const [centerElevation, ...ringElevations] = elevations;

//   const maxDrop = Math.max(...ringElevations.map((e) => Math.abs(centerElevation - e)));
//   const slopeDegrees = Math.atan(maxDrop / (distanceKm * 1000)) * (180 / Math.PI);

//   return Math.round(slopeDegrees * 100) / 100;
// }

// module.exports = { getSlope };

// services/slopeService.js
const turf = require('@turf/turf');
const { getElevationBatch } = require('./elevationService');

async function getSlope(lat, lng, knownCenterElevation = null) {
  const center = turf.point([lng, lat]);
  const bearings = [0, 90, 180, 270];
  const distanceKm = 0.1;

  const samplePoints = bearings.map((b) => turf.destination(center, distanceKm, b));
  const ringPoints = samplePoints.map((p) => ({ lat: p.geometry.coordinates[1], lng: p.geometry.coordinates[0] }));

  let centerElevation = knownCenterElevation;
  let ringElevations;

  if (centerElevation !== null) {
    // Center already known — only fetch the 4 ring points (1 request instead of 2 total)
    ringElevations = await getElevationBatch(ringPoints);
  } else {
    const elevations = await getElevationBatch([{ lat, lng }, ...ringPoints]);
    [centerElevation, ...ringElevations] = elevations;
  }

  const maxDrop = Math.max(...ringElevations.map((e) => Math.abs(centerElevation - e)));
  const slopeDegrees = Math.atan(maxDrop / (distanceKm * 1000)) * (180 / Math.PI);

  return Math.round(slopeDegrees * 100) / 100;
}

module.exports = { getSlope };