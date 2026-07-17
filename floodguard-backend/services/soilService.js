// services/soilService.js
// Free, no key: SoilGrids (ISRIC) REST API.
// Uses clay content as a proxy for drainage: high clay -> poor drainage.

const { getCached, setCached } = require('../utils/cache');

async function getSoil(lat, lng) {
  const cached = await getCached('soil', lat, lng);
  if (cached) return cached.soilDrainage;

  const url = `https://rest.isric.org/soilgrids/v2.0/properties/query` +
    `?lon=${lng}&lat=${lat}&property=clay&depth=0-5cm&value=mean`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`SoilGrids lookup failed: ${res.status}`);
    const data = await res.json();

    const clayValue = data?.properties?.layers?.[0]?.depths?.[0]?.values?.mean;
    // SoilGrids returns clay in g/kg * 10; convert to rough percentage
    const clayPercent = clayValue ? clayValue / 10 : null;

    let soilDrainage = 'Moderate';
    if (clayPercent !== null) {
      if (clayPercent > 35) soilDrainage = 'Poor';
      else if (clayPercent < 15) soilDrainage = 'Good';
    }

    await setCached('soil', lat, lng, { soilDrainage });
    return soilDrainage;
  } catch (err) {
    console.warn('Soil lookup failed, defaulting to Moderate:', err.message);
    return 'Moderate';
  }
}

module.exports = { getSoil };