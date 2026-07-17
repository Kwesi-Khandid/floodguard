// services/riskEngine.js
// Rule-based, reproducible scoring. AI only explains this result — never changes it.

function calculateRisk(data) {
  let score = 0;
  const reasons = [];

  if (data.elevation < 5) {
    score += 25;
    reasons.push('Very low elevation');
  } else if (data.elevation < 20) {
    score += 15;
    reasons.push('Low elevation');
  }

  if (data.riverDistance !== null && data.riverDistance < 100) {
    score += 25;
    reasons.push('Very close to a waterway');
  } else if (data.riverDistance !== null && data.riverDistance < 500) {
    score += 15;
    reasons.push('Moderately close to a waterway');
  }

  if (data.historicalFlood) {
    score += 20;
    reasons.push('Historical flooding recorded nearby');
  }

  if (data.slope < 2) {
    score += 10;
    reasons.push('Flat terrain, limited natural drainage');
  }

  if (data.soilDrainage === 'Poor') {
    score += 10;
    reasons.push('Poor soil drainage');
  }

  if (data.annualRainfall > 1500) {
    score += 5;
    reasons.push('High annual rainfall');
  }

  if (data.landCover === 'Urban') {
    score += 5;
    reasons.push('High proportion of impermeable surfaces');
  } else if (data.landCover === 'Wetland') {
    score += 5;
    reasons.push('Located near wetland/water-retentive land');
  }

  let level = 'LOW';
  if (score >= 75) level = 'VERY HIGH';
  else if (score >= 55) level = 'HIGH';
  else if (score >= 30) level = 'MODERATE';

  return {
    score,
    level,
    confidence: Math.min(95, score + 20),
    reasons
  };
}

module.exports = { calculateRisk };