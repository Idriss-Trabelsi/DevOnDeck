import React, { useState } from "react";
import "../styles/OrgAuth.css";

export default function OrgAuth() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    industry: "",
    size: "1-10",
    website: "",
    description: ""
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const apiBase = "http://localhost:5000/api";

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateStep = (step) => {
    const tempErrors = {};
    
    if (step === 1) {
      if (!formData.name.trim()) tempErrors.name = "Le nom est requis";
      if (!validateEmail(formData.email)) tempErrors.email = "Email invalide";
      if (!validatePassword(formData.password)) 
        tempErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setServerError("");
    
    if (!validateStep(3)) return;

    setLoading(true);

    try {
      console.log("🔄 Tentative d'inscription organisation...");
      
      const res = await fetch(`${apiBase}/org/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "Erreur lors de l'inscription");
        setLoading(false);
        return;
      }

      if (!data.success) {
        setServerError(data.error || "Échec de l'inscription");
        setLoading(false);
        return;
      }

      // Inscription réussie
      localStorage.setItem("organizationToken", data.token);
      localStorage.setItem("organizationData", JSON.stringify(data.organization));

      // Vérification du stockage
      const storedToken = localStorage.getItem("organizationToken");
      const storedData = localStorage.getItem("organizationData");
      
      if (!storedToken || !storedData) {
        setServerError("Erreur lors du stockage des données");
        setLoading(false);
        return;
      }

      // Redirection vers le dashboard
      window.location.href = "/org/dashboard";

    } catch (err) {
      console.error("💥 Erreur inscription:", err);
      setServerError("Erreur serveur lors de l'inscription: " + err.message);
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    window.location.href = "/unified-auth";
  };

  const progressPercentage = (currentStep / 3) * 100;

  return (
    <div className="org-auth-container">
      <div className="auth-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h1>Inscription Organisation</h1>
          <p>Créez votre espace entreprise</p>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="step-indicators">
            <div className={`step-indicator ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
              1
            </div>
            <div className={`step-indicator ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
              2
            </div>
            <div className={`step-indicator ${currentStep >= 3 ? 'active' : ''}`}>
              3
            </div>
          </div>
        </div>

        <form onSubmit={handleSignup} className="auth-form">
          {serverError && <div className="server-error">{serverError}</div>}

          {/* Étape 1: Informations de base */}
          <div className={`form-step ${currentStep === 1 ? 'active' : ''}`}>
            <div className="step-header">
              <div className="step-icon"></div>
              <h3>Informations de base</h3>
              <p>Créez votre compte organisation</p>
            </div>

            <div className="form-group">
              <input 
                name="name"
                placeholder="Nom de l'organisation *" 
                value={formData.name} 
                onChange={handleInputChange}
                className={errors.name ? "error" : ""}
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <input 
                name="email"
                type="email" 
                placeholder="Email *" 
                value={formData.email} 
                onChange={handleInputChange}
                className={errors.email ? "error" : ""}
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <input 
                name="password"
                type="password" 
                placeholder="Mot de passe *" 
                value={formData.password} 
                onChange={handleInputChange}
                className={errors.password ? "error" : ""}
              />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>

            <div className="step-actions">
              <button type="button" className="btn-next" onClick={nextStep}>
                Suivant
              </button>
            </div>
          </div>

          {/* Étape 2: Informations entreprise */}
          <div className={`form-step ${currentStep === 2 ? 'active' : ''}`}>
            <div className="step-header">
              <div className="step-icon">💼</div>
              <h3>Profil entreprise</h3>
              <p>Décrivez votre organisation</p>
            </div>

            <div className="form-group">
              <input 
                name="industry"
                placeholder="Secteur d'activité (ex: Technologie)" 
                value={formData.industry} 
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Taille de l'organisation</label>
              <select 
                name="size"
                value={formData.size} 
                onChange={handleInputChange}
              >
                <option value="1-10">1-10 employés</option>
                <option value="11-50">11-50 employés</option>
                <option value="51-200">51-200 employés</option>
                <option value="201-500">201-500 employés</option>
                <option value="500+">500+ employés</option>
              </select>
            </div>

            <div className="step-actions">
              <button type="button" className="btn-back" onClick={prevStep}>
                Retour
              </button>
              <button type="button" className="btn-next" onClick={nextStep}>
                Suivant
              </button>
            </div>
          </div>

          {/* Étape 3: Informations complémentaires */}
          <div className={`form-step ${currentStep === 3 ? 'active' : ''}`}>
            <div className="step-header">
              <div className="step-icon">🌐</div>
              <h3>Informations complémentaires</h3>
              <p>Complétez votre profil</p>
            </div>

            <div className="form-group">
              <input 
                name="website"
                placeholder="Site web (optionnel)" 
                value={formData.website} 
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <textarea 
                name="description"
                placeholder="Description de l'organisation (optionnel)"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
              />
            </div>

            <div className="step-actions">
              <button type="button" className="btn-back" onClick={prevStep}>
                Retour
              </button>
              <button 
                type="submit" 
                className="btn-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Création en cours...
                  </>
                ) : (
                  "Créer mon organisation"
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="auth-links">
          <p>Déjà un compte ?</p>
          <button 
            onClick={navigateToLogin}
            className="login-link"
          >
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}