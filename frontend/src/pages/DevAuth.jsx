import React, { useState } from "react";
import "../styles/DevAuth.css";

export default function DevAuth() {
  const [mode, setMode] = useState("signup");

  // Champs inscription
  const [name, setName] = useState("");
  const [emailS, setEmailS] = useState("");
  const [passwordS, setPasswordS] = useState("");
  const [skillsS, setSkillsS] = useState("");
  const [phoneS, setPhoneS] = useState("");
  const [addressS, setAddressS] = useState("");

  // Erreurs inscription
  const [errorsSignup, setErrorsSignup] = useState({});
  const [serverError, setServerError] = useState("");

  // Champs connexion
  const [emailL, setEmailL] = useState("");
  const [passwordL, setPasswordL] = useState("");

  // Erreurs connexion
  const [errorsLogin, setErrorsLogin] = useState({});
  const [serverErrorLogin, setServerErrorLogin] = useState("");

  const apiBase = "http://localhost:5000/api";

  // -----------------
  // Validation côté client
  // -----------------
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6; // 🔹 minimum 6 caractères
  const validatePhone = (phone) => phone.replace(/\s/g, "").length >= 8;

  // -----------------
  // INSCRIPTION
  // -----------------
  const handleSignup = async (e) => {
    e.preventDefault();
    setServerError("");
    let tempErrors = {};

    if (!name.trim()) tempErrors.name = "Le nom est requis";
    if (!validateEmail(emailS)) tempErrors.email = "Email invalide";
    if (!validatePassword(passwordS))
      tempErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
    if (!validatePhone(phoneS))
      tempErrors.phone = "Numéro de téléphone invalide (min 8 chiffres)";
    if (!addressS.trim()) tempErrors.address = "Adresse requise";

    setErrorsSignup(tempErrors);
    if (Object.keys(tempErrors).length > 0) return;

    try {
      const res = await fetch(`${apiBase}/dev/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: emailS,
          password: passwordS,
          skills: skillsS,
          phone: phoneS,
          address: addressS,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // message serveur fluide
        if (data.error.toLowerCase().includes("mot de passe")) {
          setErrorsSignup((prev) => ({ ...prev, password: data.error }));
        } else if (data.error.toLowerCase().includes("email")) {
          setErrorsSignup((prev) => ({ ...prev, email: data.error }));
        } else {
          setServerError(data.error || "Erreur lors de l'inscription");
        }
        return;
      }

      // inscription réussie
      localStorage.setItem("devData", JSON.stringify(data.developer));
      localStorage.setItem("devToken", data.token);
      window.location.href = "/developer/dashboard";
    } catch (err) {
      console.error(err);
      setServerError("Erreur serveur lors de l'inscription");
    }
  };

  // -----------------
  // CONNEXION
  // -----------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setServerErrorLogin("");
    let tempErrors = {};

    if (!validateEmail(emailL)) tempErrors.email = "Email invalide";
    if (!validatePassword(passwordL))
      tempErrors.password = "Le mot de passe doit contenir au moins 6 caractères";

    setErrorsLogin(tempErrors);
    if (Object.keys(tempErrors).length > 0) return;

    try {
      const res = await fetch(`${apiBase}/dev/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailL, password: passwordL }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error.toLowerCase().includes("mot de passe")) {
          setErrorsLogin((prev) => ({ ...prev, password: data.error }));
        } else if (data.error.toLowerCase().includes("email")) {
          setErrorsLogin((prev) => ({ ...prev, email: data.error }));
        } else {
          setServerErrorLogin(data.error || "Identifiants invalides");
        }
        return;
      }

      localStorage.setItem("devData", JSON.stringify(data.developer));
      localStorage.setItem("devToken", data.token);
      window.location.href = "/developer/profile";
    } catch (err) {
      console.error(err);
      setServerErrorLogin("Erreur serveur lors de la connexion");
    }
  };

  return (
    <div className="dev-auth-container">
      <div className="dev-auth-switch">
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
        <form onSubmit={handleSignup} className="dev-form">
          <h2>Inscription développeur</h2>
          {serverError && <p className="server-error">{serverError}</p>}

          <input placeholder="Nom complet" value={name} onChange={(e) => setName(e.target.value)} />
          {errorsSignup.name && <p className="error">{errorsSignup.name}</p>}

          <input type="email" placeholder="Email" value={emailS} onChange={(e) => setEmailS(e.target.value)} />
          {errorsSignup.email && <p className="error">{errorsSignup.email}</p>}

          <input type="password" placeholder="Mot de passe" value={passwordS} onChange={(e) => setPasswordS(e.target.value)} />
          {errorsSignup.password && <p className="error">{errorsSignup.password}</p>}

          <input placeholder="Compétences (ex: React, Node.js)" value={skillsS} onChange={(e) => setSkillsS(e.target.value)} />

          <input type="tel" placeholder="Numéro de téléphone" value={phoneS} onChange={(e) => setPhoneS(e.target.value)} />
          {errorsSignup.phone && <p className="error">{errorsSignup.phone}</p>}

          <input placeholder="Adresse postale" value={addressS} onChange={(e) => setAddressS(e.target.value)} />
          {errorsSignup.address && <p className="error">{errorsSignup.address}</p>}

          <button type="submit">S'inscrire et accéder au dashboard</button>
        </form>
      ) : (
        // FORMULAIRE CONNEXION
        <form onSubmit={handleLogin} className="dev-form">
          <h2>Connexion développeur</h2>
          {serverErrorLogin && <p className="server-error">{serverErrorLogin}</p>}

          <input type="email" placeholder="Email" value={emailL} onChange={(e) => setEmailL(e.target.value)} />
          {errorsLogin.email && <p className="error">{errorsLogin.email}</p>}

          <input type="password" placeholder="Mot de passe" value={passwordL} onChange={(e) => setPasswordL(e.target.value)} />
          {errorsLogin.password && <p className="error">{errorsLogin.password}</p>}

          <button type="submit">Se connecter et voir mon profil</button>
        </form>
      )}
    </div>
  );
}
