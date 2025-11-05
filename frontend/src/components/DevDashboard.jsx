import React, { useState, useEffect } from "react";
import "../styles/DevDashboard.css";

function DevDashboard() {
  const [devData, setDevData] = useState(null);
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("devData"));
    if (!data || !data.email) {
      window.location.href = "/signup-dev"; // redirection si non connecté
    } else {
      setDevData(data);
      setBio(data.bio || "");
      setSkills(data.skills || "");
      setLoading(false);
      document.title = "Dashboard Développeur | DevOnDeck";
    }
  }, []);

  if (loading) return <div>Chargement...</div>;

  // ✅ Met à jour les informations du profil dans le localStorage
  const handleUpdate = () => {
    const updatedData = { ...devData, bio, skills };
    localStorage.setItem("devData", JSON.stringify(updatedData));
    alert("Profil mis à jour ✅");
  };

  // ✅ Déconnexion
  const handleLogout = () => {
    localStorage.removeItem("devData");
    localStorage.removeItem("devToken");
    window.location.href = "/";
  };

  // ✅ Accès à la page "Mon profil"
  const handleViewProfile = () => {
    window.location.href = "/dev-profile"; // redirection vers la page du profil dev
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
        <p><strong>Nom :</strong> {devData.name || "Non défini"}</p>
        <p><strong>Email :</strong> {devData.email}</p>

        <label>Bio :</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Décris ton expérience, tes objectifs..."
        />

        <label>Compétences :</label>
        <input
          type="text"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="React, Node.js..."
        />

        <button className="save-btn" onClick={handleUpdate}>
          💾 Enregistrer
        </button>
      </section>
    </div>
  );
}

export default DevDashboard;

