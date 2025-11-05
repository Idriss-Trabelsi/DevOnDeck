import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Dashboard.css";

function AdminDashboard() {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On récupère les devs depuis le backend
    axios.get("http://localhost:5000/api/admin/developers")
      .then(res => {
        setDevelopers(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Chargement...</div>;

  const handleLogout = () => {
    localStorage.removeItem("adminData");
    localStorage.removeItem("adminToken");
    window.location.href = "/";
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>🎯 Dashboard Admin DevOnDeck</h1>
        <button className="logout-btn" onClick={handleLogout}>Se déconnecter</button>
      </header>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>👥 Développeurs</h3>
          <p className="stat-number">{developers.length}</p>
          <p className="stat-label">Inscrits</p>
        </div>

        <div className="stat-card">
          <h3>💼 Offres</h3>
          <p className="stat-number">0</p>
          <p className="stat-label">Actives</p>
        </div>

        <div className="stat-card">
          <h3>📈 Matching</h3>
          <p className="stat-number">0%</p>
          <p className="stat-label">Moyen</p>
        </div>
      </div>

      <div className="dashboard-actions">
        <h2>🚀 Actions Rapides</h2>
        <div className="action-buttons">
          <button className="action-btn" onClick={() => window.location.href='/admin/profile'}>
            Mon Profil
          </button>
          <button className="action-btn" onClick={() => window.location.href='/admin/developers'}>
            Voir les développeurs
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
