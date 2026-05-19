const axios = require("axios");
const Complaint = require("../models/Complaint.model");

/**
 * Call OpenRouter API (compatible with OpenAI format)
 */
const callOpenRouter = async (prompt) => {
  const response = await axios.post(
    `${process.env.OPENROUTER_BASE_URL}/chat/completions`,
    {
      model: "openai/gpt-3.5-turbo", // Free model on OpenRouter
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant for a government complaint management system in India. Analyze complaints and respond ONLY with valid JSON. No markdown, no explanation.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 800,
      temperature: 0.3,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://complaint-system.onrender.com",
        "X-Title": "Complaint Management System",
      },
    }
  );

  return response.data.choices[0].message.content;
};

/**
 * @route   POST /api/ai/analyze
 * @desc    Analyze a complaint using AI
 * @access  Public
 * Body: { complaintId } OR { title, description, category, location }
 */
const analyzeComplaint = async (req, res) => {
  try {
    let complaintData;

    // Load from DB or use provided data
    if (req.body.complaintId) {
      const complaint = await Complaint.findById(req.body.complaintId);
      if (!complaint) {
        return res
          .status(404)
          .json({ success: false, message: "Complaint not found" });
      }
      complaintData = complaint;
    } else {
      complaintData = req.body;
    }

    const { title, description, category, location } = complaintData;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "title and description are required for analysis",
      });
    }

    // Build prompt for OpenRouter
    const prompt = `Analyze this public complaint from India:
Title: ${title}
Description: ${description}
Category: ${category || "Unknown"}
Location: ${location || "Unknown"}

Respond with ONLY this JSON structure:
{
  "urgency": "Low|Medium|High|Critical",
  "department": "Exact department name responsible",
  "summary": "One sentence summary of the complaint",
  "autoResponse": "Professional response message to the complainant (2-3 sentences)",
  "reasoning": "Brief reason for urgency classification"
}`;

    const aiRaw = await callOpenRouter(prompt);

    // Parse AI JSON response
    let aiResult;
    try {
      // Remove markdown code fences if present
      const cleaned = aiRaw.replace(/```json|```/g, "").trim();
      aiResult = JSON.parse(cleaned);
    } catch {
      // Fallback if JSON parse fails
      aiResult = {
        urgency: "Medium",
        department: "General Administration",
        summary: title,
        autoResponse:
          "Thank you for your complaint. We have received it and will address it at the earliest.",
        reasoning: "Could not fully parse AI response",
      };
    }

    // If complaint is in DB, save the analysis
    if (req.body.complaintId) {
      await Complaint.findByIdAndUpdate(req.body.complaintId, {
        aiAnalysis: {
          urgency: aiResult.urgency,
          department: aiResult.department,
          summary: aiResult.summary,
          autoResponse: aiResult.autoResponse,
          analyzedAt: new Date(),
        },
      });
    }

    res.json({
      success: true,
      message: "AI analysis completed",
      data: aiResult,
    });
  } catch (error) {
    console.error("AI Analysis Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "AI analysis failed",
      error: error.response?.data?.error?.message || error.message,
    });
  }
};

/**
 * @route   POST /api/ai/batch-analyze
 * @desc    Analyze all pending complaints without AI analysis
 * @access  Protected (Admin)
 */
const batchAnalyze = async (req, res) => {
  try {
    const unanalyzed = await Complaint.find({
      "aiAnalysis.analyzedAt": null,
    }).limit(10);

    if (unanalyzed.length === 0) {
      return res.json({
        success: true,
        message: "All complaints are already analyzed",
        count: 0,
      });
    }

    const results = [];
    for (const complaint of unanalyzed) {
      try {
        const prompt = `Analyze: Title: ${complaint.title}. Description: ${complaint.description}. Category: ${complaint.category}.
Respond ONLY with JSON: {"urgency":"Low|Medium|High|Critical","department":"string","summary":"string","autoResponse":"string"}`;

        const aiRaw = await callOpenRouter(prompt);
        const cleaned = aiRaw.replace(/```json|```/g, "").trim();
        const aiResult = JSON.parse(cleaned);

        await Complaint.findByIdAndUpdate(complaint._id, {
          aiAnalysis: { ...aiResult, analyzedAt: new Date() },
        });

        results.push({ id: complaint._id, status: "analyzed" });
      } catch {
        results.push({ id: complaint._id, status: "failed" });
      }
    }

    res.json({ success: true, count: results.length, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { analyzeComplaint, batchAnalyze };
