// frontend/src/components/DevProfile.jsx
import React, { useEffect, useState } from "react";
import "../styles/DevProfil.css";

export default function DevProfile() {
  const [dev, setDev] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiBase = "http://localhost:5000/api";

  useEffect(() => {
    const devLocal = JSON.parse(localStorage.getItem("devData"));
    const token = localStorage.getItem("devToken");
    if (!devLocal || !token) {
      window.location.href = "/developer/login";
      return;
    }

    fetch(`${apiBase}/dev/profile/${devLocal.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) {
          setDev(data.data);
        } else {
          setDev(devLocal);
        }
      })
      .catch(() => setDev(devLocal))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <div className="centered">Chargement...</div>;

  if (!dev)
    return <div className="centered">Profil introuvable</div>;

  return (
    <div className="dev-profile-container">
      <div className="profile-card">
        <h1>👨‍💻 Mon profil</h1>
        <p><strong>Nom :</strong> {dev.name}</p>
        <p><strong>Email :</strong> {dev.email}</p>
        <p><strong>Téléphone :</strong> {dev.phone || "Non renseigné"}</p>
        <p><strong>Adresse :</strong> {dev.address || "Non renseignée"}</p>
        <p><strong>Bio :</strong> {dev.bio || "Aucune bio"}</p>
        <p><strong>Compétences :</strong></p>
        <div className="skills-container">
          {dev.skills
            ? dev.skills.split(",").map((skill, index) => (
                <span key={index} className="skill-tag">{skill.trim()}</span>
              ))
            : <span>Aucune compétence renseignée</span>
          }
        </div>

        <div className="profile-actions">
          <button
            className="edit-btn"
            onClick={() => window.location.href = "/developer/dashboard"}
          >
            ✏️ Modifier le profil
          </button>
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("devData");
              localStorage.removeItem("devToken");
              window.location.href = "/";
            }}
          >
            🚪 Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
