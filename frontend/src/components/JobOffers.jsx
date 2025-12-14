import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/JobOffers.css";
import EnhancedApplyModal from "./EnhancedApplyModal";

export default function JobOffers() {
  const navigate = useNavigate();
  const [jobOffers, setJobOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showEnhancedApply, setShowEnhancedApply] = useState(false);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, locationFilter, typeFilter, statusFilter, jobOffers]);

  const checkAuthAndFetch = async () => {
    let role = null;
    let data = null;

    const devData = localStorage.getItem("developerData");
    const orgData = localStorage.getItem("organizationData");
    const adminData = localStorage.getItem("adminData");

    if (devData) {
      role = "developer";
      data = JSON.parse(devData);
    } else if (orgData) {
      role = "organization";
      data = JSON.parse(orgData);
    } else if (adminData) {
      role = "admin";
      data = JSON.parse(adminData);
    }

    if (!role) {
      window.location.href = "/unified-auth";
      return;
    }

    setUserRole(role);
    setUserData(data);
    await fetchAllJobOffers();
  };

  const fetchAllJobOffers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/joboffers/all");
      const data = await res.json();

      if (data.success) {
        setJobOffers(data.jobOffers || []);
        setFilteredOffers(data.jobOffers || []);
      }
    } catch (error) {
      console.error("Erreur chargement offres:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfApplied = async (offerId) => {
    if (userRole !== "developer" || !userData?.id) return false;
    
    try {
      const res = await fetch(
        `http://localhost:5000/api/applications/check/${userData.id}/${offerId}`
      );
      const data = await res.json();
      
      if (data.success) {
        return data.hasApplied;
      }
      return false;
    } catch (error) {
      console.error("Erreur vérification candidature:", error);
      return false;
    }
  };

  const applyFilters = () => {
    let filtered = [...jobOffers];

    if (statusFilter !== "all") {
      filtered = filtered.filter(offer => offer.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(offer =>
        offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (offer.requiredSkills && offer.requiredSkills.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    if (locationFilter !== "all") {
      filtered = filtered.filter(offer => offer.location === locationFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(offer => offer.employmentType === typeFilter);
    }

    setFilteredOffers(filtered);
  };

  const handleViewDetails = async (offer) => {
    setSelectedOffer(offer);
    
    if (userRole === "developer" && userData?.id) {
      const applied = await checkIfApplied(offer._id);
      setHasApplied(applied);
    }
  };

  const handleCloseDetails = () => {
    setSelectedOffer(null);
    setHasApplied(false);
  };

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const goToDashboard = () => {
    switch (userRole) {
      case "developer":
        navigate("/developer/dashboard");
        break;
      case "organization":
        navigate("/org/dashboard");
        break;
      case "admin":
        navigate("/admin/dashboard");
        break;
      default:
        navigate("/");
    }
  };

  const goToMyApplications = () => {
    if (userRole === "developer") {
      navigate("/developer/applications");
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader">
          <div className="loader-spinner"></div>
          <p>Chargement des offres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="job-offers-container">
      <header className="offers-header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-btn" onClick={goToDashboard}>
              ← Retour au dashboard
            </button>
            <div className="header-title">
              <h1>💼 Offres d'Emploi</h1>
              <p>{filteredOffers.length} offre(s) disponible(s)</p>
            </div>
          </div>
          <div className="header-right">
            {userRole === "developer" && (
              <button 
                className="my-applications-btn"
                onClick={goToMyApplications}
              >
                📬 Mes Candidatures
              </button>
            )}
            <div className="user-badge">
              <span className="user-icon">
                {userRole === "developer" ? "👨‍💻" : userRole === "organization" ? "🏢" : "👨‍💼"}
              </span>
              <span className="user-name">{userData?.name}</span>
            </div>
          </div>
        </div>
      </header>

      {message.text && (
        <div className={`message-banner ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="offers-layout">
        <aside className="filters-sidebar">
          <div className="filters-card">
            <h3>🔍 Filtres</h3>

            <div className="filter-group">
              <label>Recherche</label>
              <input
                type="text"
                placeholder="Titre, compétences..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Statut</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tous</option>
                <option value="active">Actives</option>
                <option value="closed">Fermées</option>
                <option value="draft">Brouillons</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Localisation</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Toutes</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybride</option>
                <option value="Onsite">Sur site</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Type d'emploi</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tous</option>
                <option value="Full-time">Temps plein</option>
                <option value="Part-time">Temps partiel</option>
                <option value="Contract">Contrat</option>
                <option value="Internship">Stage</option>
              </select>
            </div>

            <button
              className="reset-filters-btn"
              onClick={() => {
                setSearchTerm("");
                setLocationFilter("all");
                setTypeFilter("all");
                setStatusFilter("active");
              }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        </aside>

        <main className="offers-main">
          {filteredOffers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>Aucune offre trouvée</h3>
              <p>Essayez de modifier vos filtres</p>
            </div>
          ) : (
            <div className="offers-grid">
              {filteredOffers.map((offer) => (
                <div key={offer._id} className="offer-card">
                  <div className="offer-card-header">
                    <h3>{offer.title}</h3>
                    <span className={`status-badge ${offer.status}`}>
                      {offer.status === "active" ? "🟢 Active" : 
                       offer.status === "closed" ? "🔴 Fermée" : "📝 Brouillon"}
                    </span>
                  </div>

                  <div className="offer-organization">
                    <span className="org-icon">🏢</span>
                    <span className="org-name">
                      {offer.organization?.name || "Organisation"}
                    </span>
                  </div>

                  <p className="offer-description">
                    {offer.description.substring(0, 150)}
                    {offer.description.length > 150 ? "..." : ""}
                  </p>

                  <div className="offer-tags">
                    <span className="tag location">
                      📍 {offer.location}
                    </span>
                    <span className="tag type">
                      💼 {offer.employmentType}
                    </span>
                  </div>

                  {offer.requiredSkills && offer.requiredSkills.length > 0 && (
                    <div className="offer-skills">
                      {offer.requiredSkills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="skill-badge">
                          {skill}
                        </span>
                      ))}
                      {offer.requiredSkills.length > 3 && (
                        <span className="skill-badge more">
                          +{offer.requiredSkills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="offer-footer">
                    <span className="offer-date">
                      Publié le {new Date(offer.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      className="view-details-btn"
                      onClick={() => handleViewDetails(offer)}
                    >
                      Voir détails →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {selectedOffer && (
        <div className="modal-overlay" onClick={handleCloseDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseDetails}>
              ×
            </button>

            <div className="modal-header">
              <h2>{selectedOffer.title}</h2>
              <span className={`status-badge ${selectedOffer.status}`}>
                {selectedOffer.status === "active" ? "🟢 Active" : 
                 selectedOffer.status === "closed" ? "🔴 Fermée" : "📝 Brouillon"}
              </span>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>🏢 Organisation</h3>
                <p className="organization-name">{selectedOffer.organization?.name || "Non spécifiée"}</p>
                {selectedOffer.organization?.description && (
                  <p className="org-description">{selectedOffer.organization.description}</p>
                )}
              </div>

              <div className="detail-section">
                <h3>📋 Description du poste</h3>
                <div className="description-content">
                  {selectedOffer.description.split('\n').map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h3>📍 Informations</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Localisation:</strong>
                    <span>{selectedOffer.location}</span>
                  </div>
                  <div className="info-item">
                    <strong>Type de contrat:</strong>
                    <span>{selectedOffer.employmentType}</span>
                  </div>
                  <div className="info-item">
                    <strong>Statut:</strong>
                    <span>{selectedOffer.status}</span>
                  </div>
                </div>
              </div>

              {selectedOffer.requiredSkills && selectedOffer.requiredSkills.length > 0 && (
                <div className="detail-section">
                  <h3>🛠️ Compétences requises</h3>
                  <div className="skills-list">
                    {selectedOffer.requiredSkills.map((skill, idx) => (
                      <span key={idx} className="skill-badge-large">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedOffer.salaryRange && 
               (selectedOffer.salaryRange.min > 0 || selectedOffer.salaryRange.max > 0) && (
                <div className="detail-section">
                  <h3>💰 Rémunération</h3>
                  <p className="salary-info">
                    {selectedOffer.salaryRange.min > 0 && selectedOffer.salaryRange.max > 0
                      ? `${selectedOffer.salaryRange.min}€ - ${selectedOffer.salaryRange.max}€`
                      : selectedOffer.salaryRange.min > 0
                      ? `À partir de ${selectedOffer.salaryRange.min}€`
                      : `Jusqu'à ${selectedOffer.salaryRange.max}€`}
                  </p>
                </div>
              )}

              <div className="detail-section">
                <h3>📅 Date de publication</h3>
                <p>{new Date(selectedOffer.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>

              {/* SECTION DE POSTULATION - UNIQUEMENT ENRICHIE */}
              {userRole === "developer" && selectedOffer.status === "active" && (
                <div className="application-section">
                  <h3>📝 Postuler à cette offre</h3>
                  
                  {hasApplied ? (
                    <div className="already-applied">
                      <div className="applied-icon">✅</div>
                      <div className="applied-text">
                        <h4>Vous avez déjà postulé à cette offre</h4>
                        <p>Votre candidature est en cours de revue par l'entreprise.</p>
                      </div>
                      <button 
                        className="view-applications-btn"
                        onClick={goToMyApplications}
                      >
                        Voir mes candidatures
                      </button>
                    </div>
                  ) : (
                    <div className="apply-enriched-only">
                      <div className="enriched-card">
                        <div className="card-icon">🚀</div>
                        <h4>Formulaire de candidature complet</h4>
                        <p>Présentez-vous avec un profil détaillé incluant salaire attendu, portfolio, et lettre de motivation personnalisée</p>
                        <button 
                          className="btn-apply-enhanced"
                          onClick={() => setShowEnhancedApply(true)}
                        >
                          Postuler avec formulaire complet
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showEnhancedApply && selectedOffer && userData && (
        <EnhancedApplyModal
          offer={selectedOffer}
          developer={userData}
          onClose={() => setShowEnhancedApply(false)}
          onSuccess={() => {
            setHasApplied(true);
            setShowEnhancedApply(false);
            setMessage({ 
              text: "🎉 Candidature enrichie envoyée avec succès !", 
              type: "success" 
            });
            
            setTimeout(() => {
              fetchAllJobOffers();
            }, 2000);
          }}
        />
      )}
    </div>
  );
}