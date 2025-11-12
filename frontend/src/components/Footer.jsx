// frontend/src/components/Footer.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Footer.css";

function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");

  const handleNewsletter = (e) => {
    e.preventDefault();
    // Logique newsletter à implémenter
    console.log("Newsletter subscription:", email);
    setEmail("");
    alert("Merci pour votre inscription !");
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand Section */}
        <div className="footer-brand">
          <div className="footer-logo" onClick={() => navigate("/")}>
            <span className="logo-text">DevOnDeck</span>
          </div>
          <p className="footer-description">
            La plateforme qui connecte les talents tech aux meilleures opportunités.
          </p>
          
          {/* Newsletter */}
          <div className="newsletter">
            <h5>Restez informé</h5>
            <form className="newsletter-form" onSubmit={handleNewsletter}>
              <input
                type="email"
                placeholder="Votre email"
                className="newsletter-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="newsletter-btn">
                S'inscrire
              </button>
            </form>
          </div>
        </div>

        {/* Links Sections */}
        <div className="footer-links">
          <div className="footer-section">
            <h4>Plateforme</h4>
            <button onClick={() => navigate("/dev-auth")}>Espace Développeur</button>
            <button onClick={() => navigate("/login-admin")}>Espace Admin</button>
            <button onClick={() => navigate("/")}>Accueil</button>
          </div>

          <div className="footer-section">
            <h4>Support</h4>
            <button>Aide & FAQ</button>
            <button>Contact</button>
            <button>Mentions légales</button>
          </div>

          <div className="footer-section">
            <h4>Entreprise</h4>
            <button>À propos</button>
            <button>Carrières</button>
            <button>Blog</button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>&copy; {currentYear} DevOnDeck. Tous droits réservés.</p>
          <div className="footer-bottom-links">
            <button>Confidentialité</button>
            <button>Conditions</button>
            <button>Cookies</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;