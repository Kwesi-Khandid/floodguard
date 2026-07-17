// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const floodRoutes = require('./routes/flood');
const reportRoutes = require('./routes/reports');
const geocodeRoutes = require('./routes/geocode');
const historyRoutes = require('./routes/history');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api', floodRoutes);       // POST /api/flood-risk, GET /api/flood-risk/:id
app.use('/api', reportRoutes);       // POST/GET /api/reports, GET /api/reports/stats
app.use('/api/geocode', geocodeRoutes);
app.use('/api/history', historyRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`FloodGuard API running on port ${PORT}`));