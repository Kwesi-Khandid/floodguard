// services/slopeService.js
// Derives slope from elevation samples around the point — no dedicated slope API needed.
const turf = require('@turf/turf');
const { getElevation } = require('./elevationService');

async function getSlope(lat, lng) {
  const center = turf.point([lng, lat]);
  const bearings = [0, 90, 180, 270]; // N, E, S, W
  const distanceKm = 0.1; // 100m sample radius

  const samplePoints = bearings.map((b) => turf.destination(center, distanceKm, b));

  const [centerElevation, ...ringElevations] = await Promise.all([
    getElevation(lat, lng),
    ...samplePoints.map((p) => getElevation(p.geometry.coordinates[1], p.geometry.coordinates[0]))
  ]);

  const maxDrop = Math.max(...ringElevations.map((e) => Math.abs(centerElevation - e)));
  const slopeDegrees = Math.atan(maxDrop / (distanceKm * 1000)) * (180 / Math.PI);

  return Math.round(slopeDegrees * 100) / 100;
}

module.exports = { getSlope };