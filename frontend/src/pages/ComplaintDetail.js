import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getComplaintById,
  updateComplaintStatus,
  analyzeComplaint,
} from "../utils/api";
import { useAuth } from "../context/AuthContext";

const statusClass = {
  Pending: "badge-pending",
  "In Progress": "badge-progress",
  Resolved: "badge-resolved",
  Rejected: "badge-rejected",
};

const STATUSES = ["Pending", "In Progress", "Resolved", "Rejected"];

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchComplaint = async () => {
    try {
      const res = await getComplaintById(id);
      setComplaint(res.data.data);
      setNewStatus(res.data.data.status);
    } catch {
      toast.error("Complaint not found");
      navigate("/complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaint(); }, [id]);

  const handleStatusUpdate = async () => {
    if (newStatus === complaint.status) return;
    setUpdatingStatus(true);
    try {
      const res = await updateComplaintStatus(id, newStatus);
      setComplaint(res.data.data);
      toast.success("Status updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed. Please login.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAIAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await analyzeComplaint({ complaintId: id });
      toast.success("AI analysis complete!");
      await fetchComplaint(); // Refresh
    } catch (err) {
      toast.error(err.response?.data?.message || "AI analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading...</p></div>;
  if (!complaint) return null;

  const ai = complaint.aiAnalysis;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <button className="btn btn-secondary btn-sm" style={{ marginBottom: 24 }}
          onClick={() => navigate("/complaints")}>
          ← Back to Complaints
        </button>

        {/* Header */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                <span className={`badge ${statusClass[complaint.status]}`}>{complaint.status}</span>
                <span className="badge" style={{ background: "var(--bg-input)", color: "var(--text-muted)" }}>
                  {complaint.category}
                </span>
                {ai?.urgency && (
                  <span className={`badge badge-${ai.urgency.toLowerCase()}`}>
                    🤖 {ai.urgency} Priority
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: 26, marginBottom: 8 }}>{complaint.title}</h1>
              <div style={{ display: "flex", gap: 20, color: "var(--text-muted)", fontSize: 14, flexWrap: "wrap" }}>
                <span>👤 {complaint.name}</span>
                <span>📧 {complaint.email}</span>
                <span>📍 {complaint.location}</span>
                <span>🗓 {formatDate(complaint.createdAt)}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20, padding: "16px", background: "var(--bg-input)", borderRadius: "var(--radius-sm)" }}>
            <p style={{ lineHeight: 1.7, color: "var(--text-muted)" }}>{complaint.description}</p>
          </div>
        </div>

        {/* Status Update (for logged-in users) */}
        {user && (
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 16 }}>
              🔄 Update Status
            </h3>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <select className="form-control" style={{ flex: 1 }}
                value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button className="btn btn-primary"
                onClick={handleStatusUpdate}
                disabled={updatingStatus || newStatus === complaint.status}>
                {updatingStatus ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        )}

        {/* AI Analysis */}
        {ai?.analyzedAt ? (
          <div className="ai-panel" style={{ marginBottom: 20 }}>
            <div className="ai-panel-header">🤖 AI Analysis Results</div>
            <div className="ai-grid">
              <div className="ai-item">
                <label>Priority / Urgency</label>
                <span className={`badge badge-${ai.urgency?.toLowerCase()}`}>{ai.urgency}</span>
              </div>
              <div className="ai-item">
                <label>Responsible Department</label>
                <p>{ai.department}</p>
              </div>
              <div className="ai-item" style={{ gridColumn: "1/-1" }}>
                <label>AI Summary</label>
                <p>{ai.summary}</p>
              </div>
              <div className="ai-response">
                <strong style={{ color: "var(--accent-2)", display: "block", marginBottom: 6 }}>
                  📧 Automated Response:
                </strong>
                {ai.autoResponse}
              </div>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 12 }}>
              Analyzed: {formatDate(ai.analyzedAt)}
            </p>
          </div>
        ) : (
          <div className="card" style={{ marginBottom: 20, textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
            <h3 style={{ marginBottom: 8 }}>No AI Analysis Yet</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: 20, fontSize: 14 }}>
              Run AI analysis to get priority classification, department routing, and an automated response.
            </p>
            <button className="btn btn-primary" onClick={handleAIAnalyze} disabled={analyzing}>
              {analyzing ? "🤖 Analyzing..." : "🤖 Run AI Analysis"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintDetail;
