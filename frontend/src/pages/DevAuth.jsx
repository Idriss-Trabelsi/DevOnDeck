import React, { useState } from "react";
import "../styles/DevAuth.css";

export default function DevAuth() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    skills: "",
    bio: "",
    phone: "",
    address: ""
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const apiBase = "http://localhost:5000/api";

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;
  const validatePhone = (phone) => phone.replace(/\s/g, "").length >= 8;

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
    
    if (step === 2) {
      if (!validatePhone(formData.phone)) 
        tempErrors.phone = "Numéro de téléphone invalide (min 8 chiffres)";
      if (!formData.address.trim()) tempErrors.address = "Adresse requise";
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
      console.log("🔄 Tentative d'inscription...");
      
      const res = await fetch(`${apiBase}/dev/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error && data.error.toLowerCase().includes("mot de passe")) {
          setErrors(prev => ({ ...prev, password: data.error }));
        } else if (data.error && data.error.toLowerCase().includes("email")) {
          setErrors(prev => ({ ...prev, email: data.error }));
        } else {
          setServerError(data.error || "Erreur lors de l'inscription");
        }
        setLoading(false);
        return;
      }

      if (data.success) {
        localStorage.setItem("developerData", JSON.stringify(data.developer));
        localStorage.setItem("developerToken", data.token);
        window.location.href = "/developer/dashboard";
      } else {
        setServerError("Erreur lors de l'inscription");
        setLoading(false);
      }
    } catch (err) {
      console.error("💥 Erreur:", err);
      setServerError("Erreur serveur lors de l'inscription: " + err.message);
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    window.location.href = "/unified-auth";
  };

  const progressPercentage = (currentStep / 3) * 100;

  return (
    <div className="dev-auth-container">
      <div className="auth-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h1>Inscription Développeur</h1>
          <p>Rejoignez notre communauté de talents tech</p>
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

        <form onSubmit={handleSignup} className="dev-form">
          {serverError && <div className="server-error">{serverError}</div>}

          {/* Étape 1: Informations de base */}
          <div className={`form-step ${currentStep === 1 ? 'active' : ''}`}>
            <div className="step-header">
              <div className="step-icon"></div>
              <h3>Informations personnelles</h3>
              <p>Commencez par vos informations de base</p>
            </div>

            <input 
              name="name"
              placeholder="Nom complet" 
              value={formData.name} 
              onChange={handleInputChange}
              className={errors.name ? "error" : ""}
            />
            {errors.name && <span className="error">{errors.name}</span>}

            <input 
              name="email"
              type="email" 
              placeholder="Email" 
              value={formData.email} 
              onChange={handleInputChange}
              className={errors.email ? "error" : ""}
            />
            {errors.email && <span className="error">{errors.email}</span>}

            <input 
              name="password"
              type="password" 
              placeholder="Mot de passe" 
              value={formData.password} 
              onChange={handleInputChange}
              className={errors.password ? "error" : ""}
            />
            {errors.password && <span className="error">{errors.password}</span>}

            <div className="step-actions">
              <button type="button" className="btn-next" onClick={nextStep}>
                Suivant
              </button>
            </div>
          </div>

          {/* Étape 2: Contact et localisation */}
          <div className={`form-step ${currentStep === 2 ? 'active' : ''}`}>
            <div className="step-header">
              <div className="step-icon">📍</div>
              <h3>Contact et localisation</h3>
              <p>Où peut-on vous contacter ?</p>
            </div>

            <input 
              name="phone"
              type="tel" 
              placeholder="Numéro de téléphone" 
              value={formData.phone} 
              onChange={handleInputChange}
              className={errors.phone ? "error" : ""}
            />
            {errors.phone && <span className="error">{errors.phone}</span>}

            <input 
              name="address"
              placeholder="Adresse postale" 
              value={formData.address} 
              onChange={handleInputChange}
              className={errors.address ? "error" : ""}
            />
            {errors.address && <span className="error">{errors.address}</span>}

            <div className="step-actions">
              <button type="button" className="btn-back" onClick={prevStep}>
                Retour
              </button>
              <button type="button" className="btn-next" onClick={nextStep}>
                Suivant
              </button>
            </div>
          </div>

          {/* Étape 3: Profil professionnel */}
          <div className={`form-step ${currentStep === 3 ? 'active' : ''}`}>
            <div className="step-header">
              <div className="step-icon">💼</div>
              <h3>Profil professionnel</h3>
              <p>Présentez-vous aux recruteurs</p>
            </div>

            <input 
              name="skills"
              placeholder="Compétences (ex: React, Node.js)" 
              value={formData.skills} 
              onChange={handleInputChange}
            />

            <textarea 
              name="bio"
              placeholder="Bio (présentez-vous en quelques mots)" 
              value={formData.bio} 
              onChange={handleInputChange}
              rows="3"
            />

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
                    Inscription...
                  </>
                ) : (
                  "S'inscrire et accéder au dashboard"
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