// routes/reports.js
const express = require("express");
const router = express.Router();
const {
  submitReport,
  listReports,
  reportStats,
} = require("../controllers/reportController");
const { attachUserIfPresent } = require("../middleware/auth");

router.post("/reports", attachUserIfPresent, submitReport); // guests can report; user_id attached if logged in
router.get("/reports", listReports); // public
router.get("/reports/stats", reportStats); // public, powers the dashboard chart

module.exports = router;
