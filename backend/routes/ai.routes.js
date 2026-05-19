const express = require("express");
const router = express.Router();
const { analyzeComplaint, batchAnalyze } = require("../controllers/ai.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");

// POST /api/ai/analyze - Analyze a complaint (public)
router.post("/analyze", analyzeComplaint);

// POST /api/ai/batch-analyze - Batch analyze all pending (admin only)
router.post("/batch-analyze", protect, adminOnly, batchAnalyze);

module.exports = router;
