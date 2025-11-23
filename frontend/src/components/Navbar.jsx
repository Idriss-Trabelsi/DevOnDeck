
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Accueil", icon: "🏠" },
    { path: "/dev-auth", label: "Développeurs", icon: "👨‍💻" },
    { path: "/org-auth", label: "Organisations", icon: "🏢" },
    { path: "/login-admin", label: "Admin", icon: "⚙️" }
  ];

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        {/* Logo Créatif */}
        <div 
          className="navbar-brand" 
          onClick={() => navigate("/")}
        >
          <div className="logo-orb">
            <div className="logo-core">⚡</div>
            <div className="logo-rings">
              <div className="ring ring-1"></div>
              <div className="ring ring-2"></div>
              <div className="ring ring-3"></div>
            </div>
          </div>
          <div className="logo-text">
            <span className="logo-main">DevOnDeck</span>
            <span className="logo-sub">by TechConnect</span>
          </div>
        </div>

        {/* Navigation Centrale */}
        <div className="navbar-center">
          <div className="nav-pill">
            {navItems.map((item) => (
              <button
                key={item.path}
                className={`nav-item ${isActive(item.path) ? "nav-item-active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                <div className="nav-glow"></div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions Droite */}
        <div className="navbar-actions">
          <button className="nav-cta" onClick={() => navigate("/dev-auth")}>
            <span className="cta-pulse"></span>
            <span className="cta-content">
              <span className="cta-text">Commencer</span>
              <span className="cta-arrow">⟶</span>
            </span>
          </button>

          {/* Menu Mobile */}
          <button 
            className={`mobile-trigger ${isMobileMenuOpen ? "active" : ""}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="menu-bars">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </div>

      {/* Menu Mobile Étendu */}
      <div className={`mobile-overlay ${isMobileMenuOpen ? "active" : ""}`}>
        <div className="mobile-content">
          <div className="mobile-header">
            <div className="mobile-logo">DevOnDeck</div>
            <button 
              className="mobile-close"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ✕
            </button>
          </div>
          
          <div className="mobile-nav">
            {navItems.map((item) => (
              <button
                key={item.path}
                className={`mobile-item ${isActive(item.path) ? "mobile-item-active" : ""}`}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="mobile-icon">{item.icon}</span>
                <span className="mobile-label">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="mobile-cta-section">
            <button 
              className="mobile-cta-btn"
              onClick={() => {
                navigate("/dev-auth");
                setIsMobileMenuOpen(false);
              }}
            >
              <span>🚀 Commencer l'Aventure</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;    
