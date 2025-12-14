import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminApplications.css";

export default function AdminApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const adminData = JSON.parse(localStorage.getItem("adminData"));
      const token = localStorage.getItem("adminToken");
      
      if (!adminData || !token) {
        window.location.href = "/unified-auth";
        return;
      }

      await fetchApplications();
    };

    checkAuthAndFetch();
  }, []);

  const fetchApplications = async () => {
  try {
    setLoading(true);
    console.log("🔄 Appel API pour récupérer toutes les candidatures...");
    
    const res = await fetch("http://localhost:5000/api/applications/all");
    console.log("📨 Réponse status:", res.status);
    
    const data = await res.json();
    console.log("📊 Données reçues:", data);
    
    if (data.success) {
      console.log(`✅ ${data.applications?.length || 0} candidature(s) reçue(s)`);
      setApplications(data.applications || []);
    } else {
      console.error("❌ Erreur dans la réponse:", data.error);
    }
  } catch (error) {
    console.error("💥 Erreur fetchApplications:", error);
  } finally {
    setLoading(false);
  }
};

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: "⏳ En attente", class: "status-pending" },
      reviewed: { label: "👁️‍🗨️ Consulté", class: "status-reviewed" },
      accepted: { label: "✅ Accepté", class: "status-accepted" },
      rejected: { label: "❌ Refusé", class: "status-rejected" }
    };
    return statusConfig[status] || statusConfig.pending;
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-spinner"></div>
        <p>Chargement des candidatures...</p>
      </div>
    );
  }

  return (
    <div className="admin-applications-container">
      {/* Header */}
      <header className="applications-header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-btn" onClick={() => navigate("/admin/dashboard")}>
              ← Retour au dashboard
            </button>
            <div className="header-title">
              <h1>📋 Toutes les Candidatures</h1>
              <p>{applications.length} candidature(s) au total</p>
            </div>
          </div>
          <div className="header-right">
            <div className="admin-badge">
              <span className="admin-icon">👨‍💼</span>
              <span className="admin-role">Administrateur</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tableau des candidatures */}
      <div className="applications-table-container">
        {applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>Aucune candidature trouvée</h3>
            <p>Les candidatures apparaîtront ici lorsqu'elles seront créées</p>
          </div>
        ) : (
          <table className="applications-table">
            <thead>
              <tr>
                <th>Développeur</th>
                <th>Offre</th>
                <th>Organisation</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Salaire attendu</th>
                <th>Disponibilité</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => {
                const status = getStatusBadge(app.status);
                return (
                  <tr key={app._id}>
                    <td>
                      <div className="dev-info">
                        <strong>{app.developer?.name || "N/A"}</strong>
                        <small>{app.developer?.email || ""}</small>
                        {app.developer?.skills && (
                          <div className="dev-skills">
                            {app.developer.skills.split(',').slice(0, 2).map((skill, idx) => (
                              <span key={idx} className="skill-tag">{skill.trim()}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{app.jobOffer?.title || "N/A"}</td>
                    <td>{app.organization?.name || "N/A"}</td>
                    <td>{new Date(app.applicationDate).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <span className={`status-badge ${status.class}`}>
                        {status.label}
                      </span>
                    </td>
                    <td>{app.expectedSalary > 0 ? `${app.expectedSalary}€/an` : "Non spécifié"}</td>
                    <td>{app.availabilityDate || "Immédiate"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}