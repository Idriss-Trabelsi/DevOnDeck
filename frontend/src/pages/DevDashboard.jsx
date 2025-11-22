import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DevDashboard.css";

function DevDashboard() {
  const navigate = useNavigate();

  const [devData, setDevData] = useState(null);
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Récupération des données et redirection si non connecté
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("devData"));
    if (!data || !data.email) {
      navigate("/signup-dev");
    } else {
      setDevData(data);
      setBio(data.bio || "");
      setSkills(data.skills || "");
      setPhone(data.phone || "");
      setAddress(data.address || "");
      setLoading(false);
      document.title = "Dashboard Développeur | DevOnDeck";
    }
  }, [navigate]);

  if (loading) return <div>Chargement...</div>;

  // Vérifie si des modifications ont été faites
  const isChanged =
    bio !== devData.bio ||
    skills !== devData.skills ||
    phone !== devData.phone ||
    address !== devData.address;

  // Validation simple
  const isValidPhone = /^\d{8,15}$/.test(phone); // 8 à 15 chiffres

  const handleUpdate = () => {
    if (!isValidPhone) {
      setError("Numéro de téléphone invalide (8 à 15 chiffres).");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const updatedData = { ...devData, bio, skills, phone, address };
    localStorage.setItem("devData", JSON.stringify(updatedData));
    setDevData(updatedData);
    setMessage("Profil mis à jour ✅");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("devData");
    localStorage.removeItem("devToken");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>👨‍💻 Tableau de bord Développeur</h1>
        <div className="header-buttons">
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Se déconnecter
          </button>
        </div>
      </header>

      <section className="profile-section">
        <h2>🧑 Profil</h2>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <p><strong>Nom :</strong> {devData.name || "Non défini"}</p>
        <p><strong>Email :</strong> {devData.email}</p>

        <label htmlFor="bio">Bio :</label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Décris ton expérience, tes objectifs..."
        />

        <label htmlFor="skills">Compétences :</label>
        <input
          id="skills"
          type="text"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="React, Node.js..."
        />

        <label htmlFor="phone">Numéro de téléphone :</label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Ex: 12345678"
        />

        <label htmlFor="address">Adresse :</label>
        <input
          id="address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Rue, Ville, Pays"
        />

        <button
          className="save-btn"
          onClick={handleUpdate}
          disabled={!isChanged}
          title={!isChanged ? "Aucune modification détectée" : ""}
        >
          💾 Enregistrer
        </button>
      </section>
    </div>
  );
}

export default DevDashboard;
