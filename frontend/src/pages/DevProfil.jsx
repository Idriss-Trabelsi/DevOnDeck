import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DevProfil.css";

export default function DevProfile() {
  const [dev, setDev] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Correction : utiliser les mêmes clés que dans le dashboard
    const devLocal = JSON.parse(localStorage.getItem("developerData"));
    const token = localStorage.getItem("developerToken");
    
    if (!devLocal || !token) {
      window.location.href = "/unified-auth";
      return;
    }

    setDev(devLocal);
    setLoading(false);
  }, []);

  const handleEditProfile = () => {
    // Correction : utiliser navigate au lieu de window.location
    navigate("/developer/dashboard");
  };

  const handleLogout = () => {
    // Correction : utiliser les mêmes clés que dans le dashboard
    localStorage.removeItem("developerData");
    localStorage.removeItem("developerToken");
    window.location.href = "/";
  };

  if (loading)
    return <div className="centered">Chargement...</div>;

  if (!dev)
    return <div className="centered">Profil introuvable</div>;

  return (
    <div className="dev-profile-container">
      <div className="profile-card">
        <h1>👨‍💻 Mon profil public</h1>
        
        <div className="profile-section">
          <h2>Informations personnelles</h2>
          <div className="info-grid">
            <div className="info-item">
              <strong>Nom :</strong> {dev.name}
            </div>
            <div className="info-item">
              <strong>Email :</strong> {dev.email}
            </div>
            <div className="info-item">
              <strong>Téléphone :</strong> {dev.phone || "Non renseigné"}
            </div>
            <div className="info-item">
              <strong>Adresse :</strong> {dev.address || "Non renseignée"}
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2>Bio</h2>
          <div className="bio-content">
            {dev.bio || "Aucune bio renseignée"}
          </div>
        </div>

        <div className="profile-section">
          <h2>Compétences</h2>
          <div className="skills-container">
            {dev.skills && dev.skills.length > 0
              ? dev.skills.split(",").map((skill, index) => (
                  <span key={index} className="skill-tag">{skill.trim()}</span>
                ))
              : <span className="no-skills">Aucune compétence renseignée</span>
            }
          </div>
        </div>

        <div className="profile-actions">
          <button
            className="edit-btn"
            onClick={handleEditProfile}
          >
            ✏️ Modifier le profil
          </button>
          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            🚪 Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}