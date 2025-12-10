
import React, { useState } from "react";
import "../styles/EnhancedApplicationView.css";

export default function EnhancedApplicationView({ 
  application, 
  onClose, 
  onStatusUpdate 
}) {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/applications/${application._id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus
        })
      });

      const data = await response.json();
      if (data.success) {
        onStatusUpdate(data.application);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case "pending": return "⏳ En attente";
      case "reviewed": return "👁️ Consulté";
      case "accepted": return "✅ Accepté";
      case "rejected": return "❌ Refusé";
      default: return status;
    }
  };

  return (
    <div className="app-view-overlay" onClick={onClose}>
      <div className="app-view-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="app-view-header">
          <div className="candidate-info">
            <div className="candidate-avatar">
              {application.developer?.name?.charAt(0).toUpperCase() || "D"}
            </div>
            <div>
              <h2>{application.developer?.name}</h2>
              <p className="candidate-email">{application.developer?.email}</p>
            </div>
          </div>
          
          <div className="application-meta">
            <div className="status-badge">
              {getStatusText(application.status)}
            </div>
            <div className="application-date">
              Postulé le {new Date(application.applicationDate).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="app-view-tabs">
          <button 
            className={`tab ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            👤 Profil
          </button>
          <button 
            className={`tab ${activeTab === "application" ? "active" : ""}`}
            onClick={() => setActiveTab("application")}
          >
            📝 Candidature
          </button>
          <button 
            className={`tab ${activeTab === "contact" ? "active" : ""}`}
            onClick={() => setActiveTab("contact")}
          >
            📞 Contact
          </button>
        </div>

        {/* Contenu */}
        <div className="app-view-content">
          {activeTab === "profile" && (
            <div className="tab-content">
              <div className="section">
                <h3>🛠️ Compétences</h3>
                <div className="skills-grid">
                  {application.developer?.skills?.split(',').map((skill, idx) => (
                    <span key={idx} className="skill-badge">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="section">
                <h3>📖 À propos</h3>
                <p className="bio">
                  {application.developer?.bio || "Aucune bio renseignée"}
                </p>
              </div>

              {application.developer?.address && (
                <div className="section">
                  <h3>📍 Localisation</h3>
                  <p className="location">{application.developer.address}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "application" && (
            <div className="tab-content">
              <div className="section">
                <h3>📝 Lettre de motivation</h3>
                <div className="cover-letter">
                  {application.coverLetter || "Aucune lettre de motivation fournie"}
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">💰 Salaire attendu</span>
                  <span className="detail-value">
                    {application.expectedSalary ? `${application.expectedSalary}€/an` : "Non spécifié"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">📅 Disponibilité</span>
                  <span className="detail-value">
                    {application.availabilityDate || "Immédiate"}
                  </span>
                </div>
              </div>

              {(application.portfolioUrl || application.resumeUrl) && (
                <div className="section">
                  <h3>🔗 Liens</h3>
                  <div className="links-grid">
                    {application.portfolioUrl && (
                      <a 
                        href={application.portfolioUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="link-item"
                      >
                        🌐 Portfolio
                      </a>
                    )}
                    {application.resumeUrl && (
                      <a 
                        href={application.resumeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="link-item"
                      >
                        📄 CV en ligne
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "contact" && (
            <div className="tab-content">
              <div className="section">
                <h3>📞 Coordonnées</h3>
                <div className="contact-grid">
                  <div className="contact-item">
                    <span className="contact-icon">📧</span>
                    <div>
                      <div className="contact-label">Email</div>
                      <div className="contact-value">{application.developer?.email}</div>
                    </div>
                  </div>
                  <div className="contact-item">
                    <span className="contact-icon">📱</span>
                    <div>
                      <div className="contact-label">Téléphone</div>
                      <div className="contact-value">{application.developer?.phone || "Non renseigné"}</div>
                    </div>
                  </div>
                  <div className="contact-item">
                    <span className="contact-icon">📍</span>
                    <div>
                      <div className="contact-label">Adresse</div>
                      <div className="contact-value">{application.developer?.address || "Non renseignée"}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="section">
                <h3>📋 Offre concernée</h3>
                <div className="offer-info">
                  <h4>{application.jobOffer?.title}</h4>
                  <div className="offer-details">
                    <span>📍 {application.jobOffer?.location}</span>
                    <span>💼 {application.jobOffer?.employmentType}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer avec actions */}
        <div className="app-view-footer">
          <div className="action-buttons">
            <button 
              className="btn-secondary"
              onClick={() => handleStatusChange("reviewed")}
              disabled={loading || application.status === "reviewed"}
            >
              👁️ Marquer comme vu
            </button>
            <button 
              className="btn-success"
              onClick={() => handleStatusChange("accepted")}
              disabled={loading}
            >
              ✅ Accepter
            </button>
            <button 
              className="btn-danger"
              onClick={() => handleStatusChange("rejected")}
              disabled={loading}
            >
              ❌ Refuser
            </button>
          </div>
        </div>

        <button className="close-view-btn" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
}
