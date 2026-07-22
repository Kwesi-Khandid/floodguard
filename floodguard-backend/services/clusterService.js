// services/clusterService.js
// Groups community flood reports into "areas" for the public dashboard,
// rather than showing raw, hard-to-interpret pins.

// const turf = require("@turf/turf");

// const SEVERITY_RANK = { Minor: 1, Moderate: 2, Severe: 3 };

// function clusterReports(reports, radiusKm = 0.5) {
//   if (reports.length === 0) return [];

//   const points = turf.featureCollection(
//     reports.map((r) =>
//       turf.point([r.longitude, r.latitude], {
//         id: r.id,
//         address_label: r.address_label,
//         severity: r.severity,
//         event_date: r.event_date,
//       }),
//     ),
//   );

//   const clustered = turf.clustersDbscan(points, radiusKm, {
//     units: "kilometers",
//     minPoints: 1,
//   });

//   const groups = {};
//   clustered.features.forEach((f) => {
//     const clusterId = f.properties.cluster ?? `noise-${f.properties.id}`;
//     if (!groups[clusterId]) groups[clusterId] = [];
//     groups[clusterId].push(f);
//   });

//   return Object.values(groups)
//     .map((features) => {
//       const coords = features.map((f) => f.geometry.coordinates);
//       const centroid = turf.center(turf.featureCollection(features));
//       const mostSevere = features.reduce((worst, f) => {
//         const rank = SEVERITY_RANK[f.properties.severity] || 0;
//         return rank > (SEVERITY_RANK[worst] || 0)
//           ? f.properties.severity
//           : worst;
//       }, features[0].properties.severity);

//       return {
//         latitude: centroid.geometry.coordinates[1],
//         longitude: centroid.geometry.coordinates[0],
//         areaLabel: features[0].properties.address_label || "Unnamed area",
//         reportCount: features.length,
//         mostSevereRating: mostSevere,
//         lastReported: features
//           .map((f) => f.properties.event_date)
//           .filter(Boolean)
//           .sort()
//           .pop(),
//       };
//     })
//     .sort((a, b) => b.reportCount - a.reportCount);
// }

// module.exports = { clusterReports };
