// frontend/src/components/DevAuth.jsx
import React, { useState } from "react";
import "../styles/DevAuth.css";

export default function DevAuth() {
  const [mode, setMode] = useState("signup"); // "signup" ou "login"

  // signup
  const [name, setName] = useState("");
  const [emailS, setEmailS] = useState("");
  const [passwordS, setPasswordS] = useState("");
  const [skillsS, setSkillsS] = useState("");

  // login
  const [emailL, setEmailL] = useState("");
  const [passwordL, setPasswordL] = useState("");

  const apiBase = "http://localhost:5000/api";

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBase}/dev/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: emailS, password: passwordS, skills: skillsS })
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Erreur inscription");

      localStorage.setItem("devData", JSON.stringify(data.developer));
      localStorage.setItem("devToken", data.token);

      window.location.href = "/developer/dashboard";
    } catch (err) {
      console.error(err);
      alert("Erreur serveur lors de l'inscription");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBase}/dev/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailL, password: passwordL })
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Identifiants invalides");

      localStorage.setItem("devData", JSON.stringify(data.developer));
      localStorage.setItem("devToken", data.token);

      window.location.href = "/developer/profile";
    } catch (err) {
      console.error(err);
      alert("Erreur serveur lors de la connexion");
    }
  };

  return (
    <div className="dev-auth-container">
      <div className="dev-auth-switch">
        <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>S'inscrire</button>
        <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Se connecter</button>
      </div>

      {mode === "signup" ? (
        <form onSubmit={handleSignup} className="dev-form">
          <h2>Inscription développeur</h2>
          <input placeholder="Nom" value={name} onChange={e => setName(e.target.value)} required />
          <input type="email" placeholder="Email" value={emailS} onChange={e => setEmailS(e.target.value)} required />
          <input type="password" placeholder="Mot de passe" value={passwordS} onChange={e => setPasswordS(e.target.value)} required />
          <input placeholder="Compétences (ex: React,Node.js)" value={skillsS} onChange={e => setSkillsS(e.target.value)} />
          <button type="submit">S'inscrire et accéder au dashboard</button>
        </form>
      ) : (
        <form onSubmit={handleLogin} className="dev-form">
          <h2>Connexion développeur</h2>
          <input type="email" placeholder="Email" value={emailL} onChange={e => setEmailL(e.target.value)} required />
          <input type="password" placeholder="Mot de passe" value={passwordL} onChange={e => setPasswordL(e.target.value)} required />
          <button type="submit">Se connecter et voir mon profil</button>
        </form>
      )}
    </div>
  );
}
