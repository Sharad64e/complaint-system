const express = require("express");
const router = express.Router();
const {
  addComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
  searchByLocation,
  saveAIAnalysis,
} = require("../controllers/complaint.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");
const { complaintValidation } = require("../middleware/validation.middleware");

// IMPORTANT: Specific routes must come before parameterized routes

// GET /api/complaints/search?location=Ghaziabad
router.get("/search", searchByLocation);

// POST /api/complaints - Add complaint (public, optionally authenticated)
router.post("/", complaintValidation, addComplaint);

// GET /api/complaints - Get all complaints
router.get("/", getAllComplaints);

// GET /api/complaints/:id
router.get("/:id", getComplaintById);

// PUT /api/complaints/:id - Update status (protected)
router.put("/:id", protect, updateComplaintStatus);

// PUT /api/complaints/:id/ai-analysis - Save AI results
router.put("/:id/ai-analysis", protect, saveAIAnalysis);

// DELETE /api/complaints/:id (protected, admin)
router.delete("/:id", protect, adminOnly, deleteComplaint);

module.exports = router;
