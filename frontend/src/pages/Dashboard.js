import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAllComplaints, deleteComplaint, updateComplaintStatus } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const statusClass = { Pending: "badge-pending", "In Progress": "badge-progress", Resolved: "badge-resolved", Rejected: "badge-rejected" };

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, critical: 0 });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await getAllComplaints({ limit: 100 });
      const data = res.data.data;
      setComplaints(data);
      setStats({
        total: res.data.total,
        pending: data.filter((c) => c.status === "Pending").length,
        resolved: data.filter((c) => c.status === "Resolved").length,
        critical: data.filter((c) => c.aiAnalysis?.urgency === "Critical").length,
      });
    } catch {
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this complaint permanently?")) return;
    try {
      await deleteComplaint(id);
      toast.success("Complaint deleted");
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleQuickStatus = async (id, status) => {
    try {
      await updateComplaintStatus(id, status);
      toast.success("Status updated");
      fetchAll();
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>⚙️ Admin Dashboard</h1>
          <p>Welcome back, {user?.name}. Manage all complaints from here.</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total", value: stats.total, icon: "📋", color: "var(--accent)" },
            { label: "Pending", value: stats.pending, icon: "⏳", color: "var(--warning)" },
            { label: "Resolved", value: stats.resolved, icon: "✅", color: "var(--success)" },
            { label: "Critical", value: stats.critical, icon: "🚨", color: "var(--danger)" },
          ].map((s) => (
            <div key={s.label} className="card" style={{ textAlign: "center", padding: "20px" }}>
              <div style={{ fontSize: 28 }}>{s.icon}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="empty-state"><div className="spinner" /><p>Loading...</p></div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--bg-input)", borderBottom: "1px solid var(--border)" }}>
                    {["Complaint", "Submitter", "Location", "Category", "Status", "AI Priority", "Actions"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700,
                        color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c, i) => (
                    <tr key={c._id} style={{
                      borderBottom: "1px solid var(--border)",
                      background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                      transition: "background 0.15s"
                    }}>
                      <td style={{ padding: "12px 16px", maxWidth: 200 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {c.title}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{new Date(c.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-muted)" }}>{c.name}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-muted)" }}>{c.location}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-muted)" }}>{c.category}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <select
                          value={c.status}
                          onChange={(e) => handleQuickStatus(c._id, e.target.value)}
                          style={{
                            background: "var(--bg-input)", border: "1px solid var(--border)",
                            color: "var(--text)", borderRadius: "6px", padding: "4px 8px", fontSize: 12, cursor: "pointer"
                          }}>
                          {["Pending","In Progress","Resolved","Rejected"].map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {c.aiAnalysis?.urgency ? (
                          <span className={`badge badge-${c.aiAnalysis.urgency.toLowerCase()}`}>{c.aiAnalysis.urgency}</span>
                        ) : (
                          <span style={{ color: "var(--text-dim)", fontSize: 13 }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-secondary btn-sm"
                            onClick={() => navigate(`/complaints/${c._id}`)}>View</button>
                          <button className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(c._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
