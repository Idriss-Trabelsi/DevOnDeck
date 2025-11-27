import React, { useState } from "react";
import "../styles/UnifiedAuth.css";

export default function UnifiedAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSignupOptions, setShowSignupOptions] = useState(false);

  const apiBase = "http://localhost:5000/api";

  const validateForm = () => {
    const tempErrors = {};
    
    if (!email.trim()) {
      tempErrors.email = "Email requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      tempErrors.email = "Email invalide";
    }

    if (!password) {
      tempErrors.password = "Mot de passe requis";
    } else if (password.length < 6) {
      tempErrors.password = "Mot de passe trop court";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setServerError("");
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      console.log("🔄 Tentative de connexion...", { email });
      
      const res = await fetch(`${apiBase}/auth/unified-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      console.log("📨 Réponse du serveur:", data);

      if (!res.ok) {
        setServerError(data.error || "Erreur de connexion");
        setLoading(false);
        return;
      }

      if (!data.success) {
        setServerError(data.error || "Échec de la connexion");
        setLoading(false);
        return;
      }

      console.log("💾 Stockage des données pour:", data.role);
      localStorage.setItem(`${data.role}Token`, data.token);
      localStorage.setItem(`${data.role}Data`, JSON.stringify(data.user));

      const storedToken = localStorage.getItem(`${data.role}Token`);
      const storedData = localStorage.getItem(`${data.role}Data`);
      
      console.log("✅ Données stockées:", {
        role: data.role,
        token: storedToken ? "PRÉSENT" : "MANQUANT",
        data: storedData ? "PRÉSENT" : "MANQUANT"
      });

      console.log(`🎯 Redirection vers le dashboard: ${data.role}`);
      switch (data.role) {
        case "admin":
          window.location.href = "/admin/dashboard";
          break;
        case "developer":
          window.location.href = "/developer/dashboard";
          break;
        case "organization":
          window.location.href = "/org/dashboard";
          break;
        default:
          window.location.href = "/";
      }

    } catch (err) {
      console.error("💥 Erreur connexion:", err);
      setServerError("Erreur serveur lors de la connexion");
      setLoading(false);
    }
  };

  const navigateToSignup = (userType) => {
    switch (userType) {
      case "developer":
        window.location.href = "/dev-auth";
        break;
      case "organization":
        window.location.href = "/org-auth";
        break;
      default:
        break;
    }
  };

  return (
    <div className="unified-auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Connexion DevOnDeck</h1>
          <p>Accédez à votre espace personnel</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          {serverError && (
            <div className="server-error">
              {serverError}
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className={errors.email ? "error" : ""}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              className={errors.password ? "error" : ""}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="auth-links">
          {!showSignupOptions ? (
            <button 
              onClick={() => setShowSignupOptions(true)}
              className="signup-link"
            >
              Créer un compte
            </button>
          ) : (
            <div className="signup-options">
              <p className="signup-title">Choisissez votre profil :</p>
              <div className="signup-buttons">
                <button 
                  className="signup-option developer"
                  onClick={() => navigateToSignup("developer")}
                >
                  <span className="option-icon">👨‍💻</span>
                  <span className="option-text">
                    <strong>Développeur</strong>
                    <small>Recherchez des missions</small>
                  </span>
                </button>
                
                <button 
                  className="signup-option organization"
                  onClick={() => navigateToSignup("organization")}
                >
                  <span className="option-icon">🏢</span>
                  <span className="option-text">
                    <strong>Organisation</strong>
                    <small>Recrutez des talents</small>
                  </span>
                </button>
              </div>
              
              <button 
                className="back-link"
                onClick={() => setShowSignupOptions(false)}
              >
                ← Retour
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}