
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/OrgApplications.css";
import EnhancedApplicationView from "./ApplicationView";

export default function OrgApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orgData, setOrgData] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const data = JSON.parse(localStorage.getItem("organizationData"));
      const token = localStorage.getItem("organizationToken");
      
      if (!data || !token) {
        window.location.href = "/unified-auth";
        return;
      }

      setOrgData(data);
      await fetchApplications(data.id);
    };

    checkAuthAndFetch();
  }, []);

  const fetchApplications = async (orgId) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/applications/organization/${orgId}`);
      const data = await res.json();

      if (data.success) {
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error("Erreur chargement candidatures:", error);
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

  const filteredApplications = applications.filter(app => {
    if (filter === "all") return true;
    return app.status === filter;
  });

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader">
          <div className="loader-spinner"></div>
          <p>Chargement des candidatures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="org-applications-container">
      {/* Header */}
      <header className="applications-header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-btn" onClick={() => navigate("/org/dashboard")}>
              ← Retour au dashboard
            </button>
            <div className="header-title">
              <h1>📬 Candidatures reçues</h1>
              <p>{filteredApplications.length} candidature(s)</p>
            </div>
          </div>
          <div className="header-right">
            <div className="org-badge">
              <span className="org-icon">🏢</span>
              <span className="org-name">{orgData?.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Message */}
      {message && (
        <div className={`message-banner ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* Filtres */}
      <div className="filters-bar">
        <button 
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          Toutes ({applications.length})
        </button>
        <button 
          className={`filter-btn ${filter === "pending" ? "active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          ⏳ En attente ({applications.filter(a => a.status === "pending").length})
        </button>
        <button 
          className={`filter-btn ${filter === "reviewed" ? "active" : ""}`}
          onClick={() => setFilter("reviewed")}
        >
          👁️‍🗨️ Consultées ({applications.filter(a => a.status === "reviewed").length})
        </button>
        <button 
          className={`filter-btn ${filter === "accepted" ? "active" : ""}`}
          onClick={() => setFilter("accepted")}
        >
          ✅ Acceptées ({applications.filter(a => a.status === "accepted").length})
        </button>
        <button 
          className={`filter-btn ${filter === "rejected" ? "active" : ""}`}
          onClick={() => setFilter("rejected")}
        >
          ❌ Refusées ({applications.filter(a => a.status === "rejected").length})
        </button>
      </div>

      {/* Liste des candidatures */}
      <div className="applications-list">
        {filteredApplications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>Aucune candidature trouvée</h3>
            <p>Les candidats apparaîtront ici lorsqu'ils postuleront à vos offres</p>
            <button 
              className="btn-view-offers"
              onClick={() => navigate("/job-offers")}
            >
              Voir vos offres
            </button>
          </div>
        ) : (
          filteredApplications.map((app) => (
            <div key={app._id} className="application-card">
              <div className="app-header">
                <div className="app-developer-info">
                  <div className="dev-avatar">
                    {app.developer?.name?.charAt(0).toUpperCase() || "👨‍💻"}
                  </div>
                  <div className="dev-details">
                    <h3>{app.developer?.name || "Développeur"}</h3>
                    <p className="dev-email">{app.developer?.email || "Email non disponible"}</p>
                  </div>
                </div>
                <div className="app-meta">
                  <span className={`status-badge ${getStatusBadge(app.status).class}`}>
                    {getStatusBadge(app.status).label}
                  </span>
                  <span className="app-date">
                    Postulé le {new Date(app.applicationDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>

              <div className="app-body">
                <div className="app-offer-info">
                  <h4>📋 Offre concernée</h4>
                  <p className="offer-title">{app.jobOffer?.title || "Offre"}</p>
                  <div className="offer-details">
                    <span className="detail-tag">📍 {app.jobOffer?.location || "Remote"}</span>
                    <span className="detail-tag">💼 {app.jobOffer?.employmentType || "Temps plein"}</span>
                  </div>
                </div>

                <div className="app-skills">
                  <h4>🛠️ Compétences du candidat</h4>
                  <div className="skills-tags">
                    {app.developer?.skills ? (
                      app.developer.skills.split(',').slice(0, 5).map((skill, idx) => (
                        <span key={idx} className="skill-tag">{skill.trim()}</span>
                      ))
                    ) : (
                      <span className="no-skills">Aucune compétence renseignée</span>
                    )}
                  </div>
                </div>

                {app.coverLetter && (
                  <div className="app-cover-letter">
                    <h4>📝 Lettre de motivation</h4>
                    <div className="cover-letter-content">
                      {app.coverLetter.substring(0, 150)}
                      {app.coverLetter.length > 150 ? "..." : ""}
                    </div>
                  </div>
                )}

                {/* NOUVEAU : Infos enrichies */}
                {(app.expectedSalary || app.availabilityDate) && (
                  <div className="app-enriched-info">
                    <h4>📊 Informations supplémentaires</h4>
                    <div className="enriched-details">
                      {app.expectedSalary > 0 && (
                        <div className="enriched-item">
                          <span className="enriched-label">💰 Salaire attendu:</span>
                          <span className="enriched-value">{app.expectedSalary}€/an</span>
                        </div>
                      )}
                      {app.availabilityDate && (
                        <div className="enriched-item">
                          <span className="enriched-label">📅 Disponibilité:</span>
                          <span className="enriched-value">{app.availabilityDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="app-actions">
                  <button 
                    className="btn-view-details"
                    onClick={() => setSelectedApplication(app)}
                  >
                    Voir les détails complets
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL AMÉLIORÉE */}
      {selectedApplication && (
        <EnhancedApplicationView
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onStatusUpdate={(updatedApp) => {
            // Mettre à jour la liste
            setApplications(prev => prev.map(app => 
              app._id === updatedApp._id ? updatedApp : app
            ));
            setSelectedApplication(null);
            setMessage("✅ Statut mis à jour");
            setTimeout(() => setMessage(""), 3000);
          }}
        />
      )}
    </div>
  );
}
