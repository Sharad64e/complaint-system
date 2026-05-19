const mongoose = require("mongoose");

/**
 * Complaint Schema
 * Stores all complaint data with AI analysis results
 */
const ComplaintSchema = new mongoose.Schema(
  {
    // User information
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    // Complaint details
    title: {
      type: String,
      required: [true, "Complaint title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [10, "Description must be at least 10 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Water Supply",
        "Electricity",
        "Roads & Infrastructure",
        "Sanitation & Garbage",
        "Public Safety",
        "Healthcare",
        "Education",
        "Transportation",
        "Other",
      ],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },

    // Status tracking
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Rejected"],
      default: "Pending",
    },

    // AI Analysis Results
    aiAnalysis: {
      urgency: {
        type: String,
        enum: ["Low", "Medium", "High", "Critical"],
        default: null,
      },
      department: { type: String, default: null },
      summary: { type: String, default: null },
      autoResponse: { type: String, default: null },
      analyzedAt: { type: Date, default: null },
    },

    // Reference to user who submitted
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// Index for location-based search
ComplaintSchema.index({ location: "text", title: "text", description: "text" });
ComplaintSchema.index({ category: 1, status: 1 });
ComplaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Complaint", ComplaintSchema);
