import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { addComplaint, analyzeComplaint } from "../utils/api";

const CATEGORIES = [
  "Water Supply", "Electricity", "Roads & Infrastructure",
  "Sanitation & Garbage", "Public Safety", "Healthcare",
  "Education", "Transportation", "Other"
];

const urgencyColors = { Low: "badge-low", Medium: "badge-medium", High: "badge-high", Critical: "badge-critical" };

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", title: "", description: "", category: "", location: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAnalyze = async () => {
    if (!form.title || !form.description) {
      return toast.warning("Please fill in Title and Description first");
    }
    setAnalyzing(true);
    try {
      const res = await analyzeComplaint({
        title: form.title,
        description: form.description,
        category: form.category,
        location: form.location,
      });
      setAiResult(res.data.data);
      toast.success("AI analysis complete!");
    } catch (err) {
      toast.error(err.response?.data?.message || "AI analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await addComplaint(form);
      toast.success("Complaint registered successfully!");
      setSubmitted(true);
      setTimeout(() => navigate(`/complaints/${res.data.data._id}`), 1500);
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors?.length) {
        errors.forEach((e) => toast.error(e.message));
      } else {
        toast.error(err.response?.data?.message || "Submission failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, marginBottom: 10 }}>Complaint Filed!</h2>
          <p style={{ color: "var(--text-muted)" }}>Redirecting to your complaint...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container page-narrow">
        <div className="page-header">
          <h1>📝 File a Complaint</h1>
          <p>Your complaint will be AI-analyzed for priority and department routing</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontFamily: "var(--font-display)", marginBottom: 20, fontSize: 16, color: "var(--text-muted)" }}>
              PERSONAL INFORMATION
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-control" name="name" placeholder="Rahul Kumar"
                  value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input className="form-control" type="email" name="email" placeholder="rahul@gmail.com"
                  value={form.email} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontFamily: "var(--font-display)", marginBottom: 20, fontSize: 16, color: "var(--text-muted)" }}>
              COMPLAINT DETAILS
            </h3>
            <div className="form-group">
              <label className="form-label">Complaint Title *</label>
              <input className="form-control" name="title" placeholder="e.g. Water Leakage Issue"
                value={form.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-control" name="description" rows={5}
                placeholder="Describe the issue in detail..."
                value={form.description} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-control" name="category" value={form.category} onChange={handleChange} required>
                  <option value="">Select Category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location *</label>
                <input className="form-control" name="location" placeholder="e.g. Ghaziabad"
                  value={form.location} onChange={handleChange} required />
              </div>
            </div>

            {/* AI Pre-Analysis Button */}
            <button type="button" className="btn btn-secondary btn-sm"
              onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? "🤖 Analyzing..." : "🤖 Preview AI Analysis"}
            </button>
          </div>

          {/* AI Result Display */}
          {aiResult && (
            <div className="ai-panel" style={{ marginBottom: 20 }}>
              <div className="ai-panel-header">
                🤖 AI Analysis Preview
              </div>
              <div className="ai-grid">
                <div className="ai-item">
                  <label>Priority Level</label>
                  <span className={`badge badge-${aiResult.urgency?.toLowerCase()}`}>
                    {aiResult.urgency}
                  </span>
                </div>
                <div className="ai-item">
                  <label>Suggested Department</label>
                  <p>{aiResult.department}</p>
                </div>
                <div className="ai-item">
                  <label>Summary</label>
                  <p>{aiResult.summary}</p>
                </div>
                <div className="ai-item">
                  <label>Reasoning</label>
                  <p style={{ color: "var(--text-muted)", fontSize: 13 }}>{aiResult.reasoning}</p>
                </div>
                <div className="ai-response">
                  <strong style={{ color: "var(--accent-2)", display: "block", marginBottom: 6 }}>
                    📧 Auto Response to You:
                  </strong>
                  {aiResult.autoResponse}
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Complaint →"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitComplaint;
