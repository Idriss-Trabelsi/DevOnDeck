// frontend/src/components/Navbar.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-brand" onClick={() => navigate("/")}>
          <span className="navbar-title">DevOnDeck</span>
        </div>

        {/* Navigation Links */}
        <div className="navbar-links">
          <button 
            className={`nav-link ${isActive("/") ? "active" : ""}`}
            onClick={() => navigate("/")}
          >
            Accueil
          </button>
          <button 
            className={`nav-link ${isActive("/dev-auth") ? "active" : ""}`}
            onClick={() => navigate("/dev-auth")}
          >
            Développeurs
          </button>
          <button 
            className={`nav-link ${isActive("/login-admin") ? "active" : ""}`}
            onClick={() => navigate("/login-admin")}
          >
            Admin
          </button>
        </div>

        {/* CTA Button */}
        <button 
          className="navbar-cta"
          onClick={() => navigate("/dev-auth")}
        >
          Commencer ▶
        </button>
      </div>
    </nav>
  );
}

export default Navbar;