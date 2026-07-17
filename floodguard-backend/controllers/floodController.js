// controllers/floodController.js
const pool = require('../db/pool');
const { getElevation } = require('../services/elevationService');
const { getSlope } = require('../services/slopeService');
const { getNearestWaterway } = require('../services/waterwayService');
const { getRainfall } = require('../services/rainfallService');
const { getSoil } = require('../services/soilService');
const { getLandCover } = require('../services/landCoverService');
const { getFloodHistory } = require('../services/floodHistoryService');
const { calculateRisk } = require('../services/riskEngine');
const { explainRisk } = require('../services/gptService');

async function checkFloodRisk(req, res) {
  try {
    const { latitude, longitude, addressLabel } = req.body;
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ error: 'Valid latitude and longitude are required' });
    }

    // Step: run all collectors in parallel
    const [elevation, waterway, rainfall, soilDrainage, landCover, floodHistory] = await Promise.all([
      getElevation(lat, lng),
      getNearestWaterway(lat, lng),
      getRainfall(lat, lng),
      getSoil(lat, lng),
      getLandCover(lat, lng),
      getFloodHistory(lat, lng)
    ]);
    const slope = await getSlope(lat, lng); // depends on elevation calls, kept sequential for clarity

    const factorData = {
      elevation,
      slope,
      riverDistance: waterway.distance,
      riverType: waterway.type,
      historicalFlood: floodHistory.historicalFlood,
      annualRainfall: rainfall,
      soilDrainage,
      landCover
    };

    // Step: reproducible rule-based score
    const risk = calculateRisk(factorData);

    // Step: AI explains the computed facts, does not change them
    let analysis;
    try {
      analysis = await explainRisk(risk);
    } catch (err) {
      console.warn('GPT explanation unavailable, using fallback text:', err.message);
      analysis = {
        summary: `This site is classified as ${risk.level} risk (score ${risk.score}/100) based on: ${risk.reasons.join(', ')}.`,
        recommendation: 'Commission a site-specific engineering assessment before building.',
        buyerAdvice: 'Review local planning records and flood history before purchasing.'
      };
    }

    const userId = req.user?.id || null;

    const { rows } = await pool.query(
      `INSERT INTO risk_assessments
        (user_id, latitude, longitude, address_label, elevation, slope, river_distance, river_type,
         historical_flood, annual_rainfall, soil_drainage, land_cover, risk_score, risk_level,
         confidence, reasons, ai_summary, ai_recommendation, ai_buyer_advice)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       RETURNING id`,
      [
        userId, lat, lng, addressLabel || null, elevation, slope, factorData.riverDistance,
        factorData.riverType, factorData.historicalFlood, rainfall, soilDrainage, landCover,
        risk.score, risk.level, risk.confidence, JSON.stringify(risk.reasons),
        analysis.summary, analysis.recommendation, analysis.buyerAdvice
      ]
    );

    res.json({
      id: rows[0].id,
      coordinates: { latitude: lat, longitude: lng },
      risk: { level: risk.level, score: risk.score, confidence: risk.confidence },
      factors: factorData,
      analysis
    });
  } catch (err) {
    console.error('Flood risk check failed:', err);
    res.status(500).json({ error: 'Failed to assess flood risk. Please try again.' });
  }
}

async function getAssessmentById(req, res) {
  const { rows } = await pool.query('SELECT * FROM risk_assessments WHERE id = $1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Assessment not found' });
  res.json(rows[0]);
}

module.exports = { checkFloodRisk, getAssessmentById };