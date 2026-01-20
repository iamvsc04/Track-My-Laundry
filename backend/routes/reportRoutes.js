const express = require("express");
const router = express.Router();
const { generateDailyReport } = require("../controllers/reportController");
const { protect, admin } = require("../middlewares/authMiddleware");

router.get("/daily", protect, admin, generateDailyReport);

module.exports = router;
