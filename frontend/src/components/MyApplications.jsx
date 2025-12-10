import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MyApplications.css";

export default function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      const data = JSON.parse(localStorage.getItem("developerData"));
      const token = localStorage.getItem("developerToken");
      
      if (!data || !token) {
        window.location.href = "/unified-auth";
        return;
      }

      setUserData(data);

      try {
        const res = await fetch(
          `http://localhost:5000/api/applications/developer/${data.id}`
        );
        const result = await res.json();
        
        if (result.success) {
          setApplications(result.applications || []);
        }
      } catch (error) {
        console.error("Erreur chargement candidatures:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: "⏳ En attente", className: "pending", icon: "⏳" },
      reviewed: { text: "👁️‍🗨️ Vu par l'entreprise", className: "reviewed", icon: "👁️‍🗨️" },
      accepted: { text: "✅ Accepté", className: "accepted", icon: "✅" },
      rejected: { text: "❌ Refusé", className: "rejected", icon: "❌" }
    };
    
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-spinner"></div>
        <p>Chargement de vos candidatures...</p>
      </div>
    );
  }

  return (
    <div className="applications-container">
      <header className="applications-header">
        <button className="back-btn" onClick={() => navigate("/developer/dashboard")}>
          ← Retour au dashboard
        </button>
        <h1>📬 Mes Candidatures</h1>
        <p>{applications.length} candidature(s)</p>
      </header>

      {applications.length === 0 ? (
        <div className="empty-applications">
          <div className="empty-icon">📭</div>
          <h3>Vous n'avez pas encore postulé</h3>
          <p>Explorez les offres d'emploi et postulez à celles qui vous intéressent</p>
          <button 
            className="btn-browse-offers"
            onClick={() => navigate("/job-offers")}
          >
            Voir les offres disponibles
          </button>
        </div>
      ) : (
        <div className="applications-grid">
          {applications.map((app) => {
            const status = getStatusBadge(app.status);
            
            return (
              <div key={app._id} className="application-card-enhanced">
                <div className="card-header">
                  <h3>{app.jobOffer?.title}</h3>
                  <span className={`status-badge ${status.className}`}>
                    {status.icon} {status.text}
                  </span>
                </div>
                
                <div className="company-info">
                  <span className="company-icon">🏢</span>
                  <span>{app.organization?.name || "Organisation"}</span>
                </div>
                
                <div className="application-details">
                  <div className="detail">
                    <strong>📍 Lieu:</strong>
                    <span>{app.jobOffer?.location || "Remote"}</span>
                  </div>
                  <div className="detail">
                    <strong>💼 Type:</strong>
                    <span>{app.jobOffer?.employmentType || "Temps plein"}</span>
                  </div>
                  <div className="detail">
                    <strong>📅 Date de candidature:</strong>
                    <span>{new Date(app.applicationDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                  
                  {/* NOUVEAU : Infos enrichies */}
                  {app.expectedSalary > 0 && (
                    <div className="detail enriched">
                      <strong>💰 Salaire attendu:</strong>
                      <span>{app.expectedSalary}€/an</span>
                    </div>
                  )}
                  
                  {app.availabilityDate && (
                    <div className="detail enriched">
                      <strong>📅 Disponibilité:</strong>
                      <span>{app.availabilityDate}</span>
                    </div>
                  )}
                  
                  {app.viewedByOrganization && (
                    <div className="detail viewed">
                      <strong>👁️ Statut:</strong>
                      <span>Vue par l'entreprise</span>
                    </div>
                  )}
                </div>
                
                {app.coverLetter && (
                  <div className="cover-letter-preview">
                    <strong>📝 Votre message:</strong>
                    <p>{app.coverLetter.substring(0, 100)}...</p>
                  </div>
                )}
                
                <div className="card-actions">
                  <button 
                    className="btn-view-offer"
                    onClick={() => navigate("/job-offers")}
                  >
                    Voir l'offre
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
