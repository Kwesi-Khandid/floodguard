// routes/geocode.js
// Proxies Nominatim reverse geocoding so the frontend avoids CORS issues
// and so we can set the required User-Agent header.
const express = require('express');
const router = express.Router();

router.get('/reverse', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng are required' });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'User-Agent': 'FloodGuard-App/1.0 (student project, contact: neuehancedwebtechnologies@gmail.com)' } }
    );
    const data = await response.json();
    res.json({ label: data.display_name || `${lat}, ${lng}` });
  } catch (err) {
    console.error('Reverse geocode failed:', err);
    res.status(500).json({ error: 'Could not resolve location name' });
  }
});

module.exports = router;