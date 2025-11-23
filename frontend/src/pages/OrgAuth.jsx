import React, { useState } from "react";
import "../styles/OrgAuth.css";

export default function OrgAuth() {
  const [mode, setMode] = useState("signup");

  // États inscription
  const [name, setName] = useState("");
  const [emailS, setEmailS] = useState("");
  const [passwordS, setPasswordS] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("1-10");
  const [website, setWebsite] = useState("");

  // États connexion
  const [emailL, setEmailL] = useState("");
  const [passwordL, setPasswordL] = useState("");

  // États erreurs
  const [errorsSignup, setErrorsSignup] = useState({});
  const [errorsLogin, setErrorsLogin] = useState({});
  const [serverError, setServerError] = useState("");
  const [serverErrorLogin, setServerErrorLogin] = useState("");

  const apiBase = "http://localhost:5000/api";

  // Validation
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;

  // INSCRIPTION ORGANIZATION
  const handleSignup = async (e) => {
    e.preventDefault();
    setServerError("");
    let tempErrors = {};

    if (!name.trim()) tempErrors.name = "Le nom est requis";
    if (!validateEmail(emailS)) tempErrors.email = "Email invalide";
    if (!validatePassword(passwordS))
      tempErrors.password = "Le mot de passe doit contenir au moins 6 caractères";

    setErrorsSignup(tempErrors);
    if (Object.keys(tempErrors).length > 0) return;

    try {
      const res = await fetch(`${apiBase}/org/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: emailS,
          password: passwordS,
          industry,
          size,
          website
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "Erreur lors de l'inscription");
        return;
      }

      // Inscription réussie
      localStorage.setItem("orgData", JSON.stringify(data.organization));
      localStorage.setItem("orgToken", data.token);
      window.location.href = "/org/dashboard";
    } catch (err) {
      console.error(err);
      setServerError("Erreur serveur lors de l'inscription");
    }
  };

  // CONNEXION ORGANIZATION
  const handleLogin = async (e) => {
    e.preventDefault();
    setServerErrorLogin("");
    let tempErrors = {};

    if (!validateEmail(emailL)) tempErrors.email = "Email invalide";
    if (!validatePassword(passwordL))
      tempErrors.password = "Mot de passe incorrect";

    setErrorsLogin(tempErrors);
    if (Object.keys(tempErrors).length > 0) return;

    try {
      const res = await fetch(`${apiBase}/org/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailL, password: passwordL }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerErrorLogin(data.message || "Identifiants invalides");
        return;
      }

      localStorage.setItem("orgData", JSON.stringify(data.organization));
      localStorage.setItem("orgToken", data.token);
      window.location.href = "/org/dashboard";
    } catch (err) {
      console.error(err);
      setServerErrorLogin("Erreur serveur lors de la connexion");
    }
  };

  return (
    <div className="org-auth-container">
      <div className="auth-switch">
        <button
          className={mode === "signup" ? "active" : ""}
          onClick={() => setMode("signup")}
        >
          S'inscrire
        </button>
        <button
          className={mode === "login" ? "active" : ""}
          onClick={() => setMode("login")}
        >
          Se connecter
        </button>
      </div>

      {/* FORMULAIRE INSCRIPTION */}
      {mode === "signup" ? (
        <form onSubmit={handleSignup} className="auth-form">
          <h2>Inscription Organisation</h2>
          {serverError && <p className="server-error">{serverError}</p>}

          <input 
            placeholder="Nom de l'organisation" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
          {errorsSignup.name && <p className="error">{errorsSignup.name}</p>}

          <input 
            type="email" 
            placeholder="Email" 
            value={emailS} 
            onChange={(e) => setEmailS(e.target.value)} 
          />
          {errorsSignup.email && <p className="error">{errorsSignup.email}</p>}

          <input 
            type="password" 
            placeholder="Mot de passe" 
            value={passwordS} 
            onChange={(e) => setPasswordS(e.target.value)} 
          />
          {errorsSignup.password && <p className="error">{errorsSignup.password}</p>}

          <input 
            placeholder="Secteur d'activité (ex: Technologie)" 
            value={industry} 
            onChange={(e) => setIndustry(e.target.value)} 
          />

          <select value={size} onChange={(e) => setSize(e.target.value)}>
            <option value="1-10">1-10 employés</option>
            <option value="11-50">11-50 employés</option>
            <option value="51-200">51-200 employés</option>
            <option value="201-500">201-500 employés</option>
            <option value="500+">500+ employés</option>
          </select>

          <input 
            placeholder="Site web (optionnel)" 
            value={website} 
            onChange={(e) => setWebsite(e.target.value)} 
          />

          <button type="submit">Créer mon organisation</button>
        </form>
      ) : (
        /* FORMULAIRE CONNEXION */
        <form onSubmit={handleLogin} className="auth-form">
          <h2>Connexion Organisation</h2>
          {serverErrorLogin && <p className="server-error">{serverErrorLogin}</p>}

          <input 
            type="email" 
            placeholder="Email" 
            value={emailL} 
            onChange={(e) => setEmailL(e.target.value)} 
          />
          {errorsLogin.email && <p className="error">{errorsLogin.email}</p>}

          <input 
            type="password" 
            placeholder="Mot de passe" 
            value={passwordL} 
            onChange={(e) => setPasswordL(e.target.value)} 
          />
          {errorsLogin.password && <p className="error">{errorsLogin.password}</p>}

          <button type="submit">Se connecter</button>
        </form>
      )}
    </div>
  );
}