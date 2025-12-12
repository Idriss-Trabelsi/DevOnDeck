import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Dashboard.css";

function AdminDashboard() {
  const [developers, setDevelopers] = useState([]);
  const [jobOffers, setJobOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer les développeurs et les offres
    const fetchData = async () => {
      try {
        // Récupérer les développeurs
        const devsResponse = await axios.get("http://localhost:5000/api/admin/developers");
        setDevelopers(devsResponse.data.data);

        // Récupérer toutes les offres d'emploi
        const offersResponse = await axios.get("http://localhost:5000/api/joboffers/all");
        setJobOffers(offersResponse.data.jobOffers || []);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculer le nombre d'offres actives
  const activeOffersCount = jobOffers.filter(offer => offer.status === 'active').length;

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
          <p className="stat-number">{activeOffersCount}</p>
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
          <button 
           className="action-btn" 
           onClick={() => window.location.href='/job-offers'}
          >
           Voir toutes les offres ({jobOffers.length})
         </button>
         <button 
          className="action-btn" 
          onClick={() => window.location.href = "/admin/applications"}
          >
            📋 Voir toutes les candidatures
            </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;