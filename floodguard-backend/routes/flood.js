// routes/flood.js
const express = require("express");
const router = express.Router();
const {
  checkFloodRisk,
  getAssessmentById,
} = require("../controllers/floodController");
const { attachUserIfPresent } = require("../middleware/auth");

router.post("/flood-risk", attachUserIfPresent, checkFloodRisk);
router.get("/flood-risk/:id", getAssessmentById);

module.exports = router;
