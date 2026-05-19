import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path ? "nav-link active" : "nav-link";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">⚖️</div>
          Civil<span>Resolve</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className={isActive("/")}>Home</Link>
          <Link to="/complaints" className={isActive("/complaints")}>All Complaints</Link>
          <Link to="/submit" className={isActive("/submit")}>File Complaint</Link>
          {user && <Link to="/dashboard" className={isActive("/dashboard")}>Dashboard</Link>}

          {user ? (
            <div className="nav-user">
              <span>👤 <strong>{user.name}</strong></span>
              <button className="btn-logout" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-btn">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
