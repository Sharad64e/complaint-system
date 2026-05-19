import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAllComplaints, searchByLocation } from "../utils/api";

const CATEGORIES = [
  "", "Water Supply", "Electricity", "Roads & Infrastructure",
  "Sanitation & Garbage", "Public Safety", "Healthcare",
  "Education", "Transportation", "Other"
];
const STATUSES = ["", "Pending", "In Progress", "Resolved", "Rejected"];

const statusClass = {
  Pending: "badge-pending",
  "In Progress": "badge-progress",
  Resolved: "badge-resolved",
  Rejected: "badge-rejected",
};

const ComplaintList = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ category: "", status: "", location: "" });
  const [searchInput, setSearchInput] = useState("");

  const fetchComplaints = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      let res;
      if (filters.location) {
        res = await searchByLocation(filters.location);
        setComplaints(res.data.data);
        setPagination({ page: 1, totalPages: 1, total: res.data.count });
      } else {
        const params = { page, limit: 10 };
        if (filters.category) params.category = filters.category;
        if (filters.status) params.status = filters.status;
        res = await getAllComplaints(params);
        setComplaints(res.data.data);
        setPagination({ page, totalPages: res.data.totalPages, total: res.data.total });
      }
    } catch {
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchComplaints(1);
  }, [fetchComplaints]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, location: searchInput }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value, location: "" }));
    setSearchInput("");
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>📋 All Complaints</h1>
          <p>{pagination.total} complaints found</p>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <form onSubmit={handleSearch} className="search-box" style={{ flex: 2, display: "flex", gap: 8 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <span className="search-icon">🔍</span>
              <input className="form-control" style={{ paddingLeft: 40 }}
                placeholder="Search by location..."
                value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm">Search</button>
            {filters.location && (
              <button type="button" className="btn btn-secondary btn-sm"
                onClick={() => { setSearchInput(""); setFilters(f => ({ ...f, location: "" })); }}>
                ✕ Clear
              </button>
            )}
          </form>

          <select className="form-control" style={{ flex: 1 }}
            value={filters.category} onChange={(e) => handleFilterChange("category", e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.filter(Boolean).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select className="form-control" style={{ flex: 1 }}
            value={filters.status} onChange={(e) => handleFilterChange("status", e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* List */}
        {loading ? (
          <div className="empty-state"><div className="spinner" /><p>Loading complaints...</p></div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📭</div>
            <h3>No complaints found</h3>
            <p style={{ color: "var(--text-muted)" }}>Try adjusting your filters</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {complaints.map((c) => (
              <div key={c._id} className="complaint-card" onClick={() => navigate(`/complaints/${c._id}`)}>
                <div>
                  <div className="complaint-title">{c.title}</div>
                  <div className="complaint-meta">
                    <span>👤 {c.name}</span>
                    <span>📂 {c.category}</span>
                    <span>📍 {c.location}</span>
                    <span>🗓 {formatDate(c.createdAt)}</span>
                    {c.aiAnalysis?.urgency && (
                      <span className={`badge badge-${c.aiAnalysis.urgency.toLowerCase()}`}>
                        🤖 {c.aiAnalysis.urgency}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className={`badge ${statusClass[c.status] || "badge-pending"}`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28 }}>
            <button className="btn btn-secondary btn-sm"
              onClick={() => fetchComplaints(pagination.page - 1)}
              disabled={pagination.page === 1}>← Prev</button>
            <span style={{ padding: "8px 16px", color: "var(--text-muted)", fontSize: 14 }}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button className="btn btn-secondary btn-sm"
              onClick={() => fetchComplaints(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintList;
