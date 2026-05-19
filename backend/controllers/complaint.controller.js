const Complaint = require("../models/Complaint.model");

/**
 * @route   POST /api/complaints
 * @desc    Add a new complaint
 * @access  Public
 */
const addComplaint = async (req, res) => {
  try {
    const { name, email, title, description, category, location } = req.body;

    const complaint = await Complaint.create({
      name,
      email,
      title,
      description,
      category,
      location,
      submittedBy: req.user ? req.user._id : null,
    });

    res.status(201).json({
      success: true,
      message: "Complaint registered successfully",
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/complaints
 * @desc    Get all complaints (with optional category filter)
 * @access  Public
 */
const getAllComplaints = async (req, res) => {
  try {
    const { category, status, page = 1, limit = 10 } = req.query;

    // Build query filter
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Complaint.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: complaints.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: complaints,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/complaints/:id
 * @desc    Get a single complaint by ID
 * @access  Public
 */
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });
    }
    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PUT /api/complaints/:id
 * @desc    Update complaint status
 * @access  Protected
 */
const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "In Progress", "Resolved", "Rejected"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });
    }

    res.json({
      success: true,
      message: "Status updated successfully",
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   DELETE /api/complaints/:id
 * @desc    Delete a complaint
 * @access  Protected (Admin)
 */
const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });
    }
    res.json({ success: true, message: "Complaint deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/complaints/search?location=Ghaziabad
 * @desc    Search complaints by location
 * @access  Public
 */
const searchByLocation = async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) {
      return res
        .status(400)
        .json({ success: false, message: "Location query parameter required" });
    }

    const complaints = await Complaint.find({
      location: { $regex: location, $options: "i" },
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: complaints.length,
      searchedLocation: location,
      data: complaints,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PUT /api/complaints/:id/ai-analysis
 * @desc    Save AI analysis results to complaint
 * @access  Protected
 */
const saveAIAnalysis = async (req, res) => {
  try {
    const { urgency, department, summary, autoResponse } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        aiAnalysis: {
          urgency,
          department,
          summary,
          autoResponse,
          analyzedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });
    }

    res.json({
      success: true,
      message: "AI analysis saved",
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
  searchByLocation,
  saveAIAnalysis,
};
