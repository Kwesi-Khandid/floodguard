// routes/auth.js
const express = require("express");
const router = express.Router();
const { googleLogin, logout, me } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

router.post("/google", googleLogin);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

module.exports = router;
