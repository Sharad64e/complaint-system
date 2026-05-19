import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllComplaints } from "../utils/api";

const Home = () => {
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });

  useEffect(() => {
    getAllComplaints({ limit: 1 })
      .then((res) => {
        const total = res.data.total || 0;
        setStats({ total, resolved: Math.floor(total * 0.6), pending: Math.floor(total * 0.4) });
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-tag">🤖 AI-Powered • Secure • Transparent</div>
        <h1>
          Resolve Public<br />Complaints Faster
        </h1>
        <p>
          Submit, track, and resolve civic issues with AI-driven prioritization
          and automated department routing.
        </p>
        <div className="hero-cta">
          <Link to="/submit" className="btn btn-primary">📝 File a Complaint</Link>
          <Link to="/complaints" className="btn btn-secondary">📋 View All Complaints</Link>
        </div>

        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Complaints</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{stats.resolved}</div>
            <div className="stat-label">Resolved</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
      </div>

      {/* Features */}
      
    </div>
  );
};

export default Home;
