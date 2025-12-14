import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/OrgDashboard.css";

function OrgDashboard() {
  const navigate = useNavigate();
  const [orgData, setOrgData] = useState(null);
  const [jobOffers, setJobOffers] = useState([]);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [message, setMessage] = useState("");

  const [newOffer, setNewOffer] = useState({
    title: "",
    description: "",
    requiredSkills: "",
    location: "Remote",
    employmentType: "Full-time",
  });

  useEffect(() => {
    const checkAuth = () => {
      const data = JSON.parse(localStorage.getItem("organizationData"));
      const token = localStorage.getItem("organizationToken");
      
      console.log("🔍 Vérification auth organisation:", { 
        data: data, 
        token: token ? "PRÉSENT" : "MANQUANT" 
      });
      
      if (!data || !token) {
        console.log("❌ Organisation non authentifiée, redirection...");
        window.location.href = "/unified-auth";
        return;
      }

      console.log("✅ Organisation authentifiée:", data.name);
      setOrgData(data);
      fetchJobOffers(data.id);
      fetchApplicationsCount(data.id);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const fetchJobOffers = async (orgId) => {
    try {
      console.log("🔄 Récupération des offres pour orgId:", orgId);
      const res = await fetch(`http://localhost:5000/api/joboffers/organization/${orgId}`);
      const data = await res.json();
      
      console.log("📋 Offres reçues:", data);
      
      if (data.success) {
        setJobOffers(data.jobOffers || []);
      }
    } catch (error) {
      console.error("Erreur fetchJobOffers:", error);
    }
  };

  const fetchApplicationsCount = async (orgId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/applications/organization/${orgId}`);
      const data = await res.json();
      
      if (data.success) {
        setApplicationsCount(data.applications?.length || 0);
      }
    } catch (error) {
      console.error("Erreur fetchApplicationsCount:", error);
    }
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/joboffers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newOffer,
          organizationId: orgData.id,
          requiredSkills: newOffer.requiredSkills.split(",").map(skill => skill.trim()).filter(skill => skill !== "")
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setMessage("✅ Offre créée avec succès !");
        setShowCreateForm(false);
        setNewOffer({
          title: "",
          description: "",
          requiredSkills: "",
          location: "Remote",
          employmentType: "Full-time",
        });
        fetchJobOffers(orgData.id);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`❌ Erreur: ${data.error}`);
      }
    } catch (error) {
      console.error("Erreur création:", error);
      setMessage("❌ Erreur lors de la création de l'offre");
    }
  };

  const handleEditOffer = (offer) => {
    setEditingOffer(offer);
    setNewOffer({
      title: offer.title,
      description: offer.description,
      requiredSkills: offer.requiredSkills?.join(", ") || "",
      location: offer.location,
      employmentType: offer.employmentType,
    });
    setShowEditForm(true);
  };

  const handleUpdateOffer = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/joboffers/${editingOffer._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newOffer,
          requiredSkills: newOffer.requiredSkills.split(",").map(skill => skill.trim()).filter(skill => skill !== "")
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setMessage("✅ Offre modifiée avec succès !");
        setShowEditForm(false);
        setEditingOffer(null);
        setNewOffer({
          title: "",
          description: "",
          requiredSkills: "",
          location: "Remote",
          employmentType: "Full-time",
        });
        fetchJobOffers(orgData.id);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`❌ Erreur: ${data.error}`);
      }
    } catch (error) {
      console.error("Erreur modification:", error);
      setMessage("❌ Erreur lors de la modification de l'offre");
    }
  };

  const handleDeleteOffer = async (offerId) => {
    setConfirmDelete(offerId);
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    
    setMessage("🗑️ Suppression en cours...");
    
    try {
      const res = await fetch(`http://localhost:5000/api/joboffers/${confirmDelete}`, {
        method: "DELETE"
      });

      const data = await res.json();
      
      if (data.success) {
        setMessage("✅ Offre supprimée avec succès !");
        fetchJobOffers(orgData.id);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`❌ Erreur: ${data.error}`);
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      setMessage("❌ Erreur lors de la suppression de l'offre");
    }
    
    setConfirmDelete(null);
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("organizationData");
    localStorage.removeItem("organizationToken");
    window.location.href = "/";
  };

  // CALCUL DYNAMIQUE des statistiques
  const totalOffers = jobOffers.length;
  const activeOffers = jobOffers.filter(offer => offer.status === 'active').length;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader">
          <div className="loader-spinner"></div>
          <p>Chargement de votre espace organisation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="org-dashboard-pro">
      {/* Header Professionnel */}
      <header className="dashboard-header-pro">
        <div className="header-container">
          <div className="brand-section">
            <div className="logo">💎</div>
            <div className="brand-text">
              <h1>DevOnDeck</h1>
              <span className="brand-subtitle">Organization Portal</span>
            </div>
          </div>

          <div className="header-actions-pro">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Rechercher..." />
            </div>
            <div className="user-menu">
              <div className="user-avatar">
                <span>🏢</span>
              </div>
              <div className="user-info">
                <span className="user-name">{orgData?.name}</span>
                <span className="user-role">Organization</span>
              </div>
            </div>
            <button className="logout-btn-visible" onClick={handleLogout}>
              <span className="logout-icon">🚪</span>
              <span className="logout-text">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Message de confirmation */}
      {message && (
        <div className={`message-banner ${message.includes('✅') || message.includes('🗑️') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="dashboard-layout">
        {/* Navigation Latérale */}
        <nav className="sidebar-pro">
          <div className="org-profile-card">
            <div className="org-avatar-pro">
              <span>🏢</span>
            </div>
            <div className="org-info-pro">
              <h3>{orgData?.name}</h3>
              <p>{orgData?.industry || "Secteur non spécifié"}</p>
              <span className="org-badge">PRO</span>
            </div>
          </div>

          <div className="nav-menu">
            <button 
              className={`nav-item-pro ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-label">Tableau de bord</span>
            </button>

            <button 
              className={`nav-item-pro ${activeTab === "offers" ? "active" : ""}`}
              onClick={() => setActiveTab("offers")}
            >
              <span className="nav-icon">💼</span>
              <span className="nav-label">Offres d'emploi</span>
              <span className="nav-badge">{totalOffers}</span>
            </button>

            {/* AJOUT DU BOUTON CANDIDATURES */}
            <button 
              className={`nav-item-pro ${activeTab === "applications" ? "active" : ""}`}
              onClick={() => navigate("/org/applications")}
            >
              <span className="nav-icon">📬</span>
              <span className="nav-label">Candidatures</span>
              <span className="nav-badge">{applicationsCount}</span>
            </button>
          </div>
          
          <button 
            className="nav-item-pro"
            onClick={() => navigate("/job-offers")}
          >
            <span className="nav-icon">🌐</span>
            <span className="nav-label">Toutes les offres</span>
          </button>

          <div className="sidebar-footer">
            <button className="upgrade-card">
              <span className="upgrade-icon">🚀</span>
              <div className="upgrade-content">
                <span>Passer à Premium</span>
                <small>Débloquez plus de fonctionnalités</small>
              </div>
            </button>
          </div>
        </nav>

        {/* Contenu Principal */}
        <main className="main-content-pro">
          {/* En-tête de section */}
          <div className="content-header">
            <div className="header-title">
              <h2>Tableau de bord</h2>
              <p>Bienvenue dans votre espace organisation</p>
              <div className="stats-preview">
                <span className="stat-preview">{totalOffers} offres</span>
                <span className="stat-preview">{activeOffers} actives</span>
                <span className="stat-preview">{applicationsCount} candidatures</span>
              </div>
            </div>
            <button 
              className="primary-btn"
              onClick={() => setShowCreateForm(true)}
            >
              <span>+</span>
              Nouvelle offre
            </button>
          </div>

          {/* Cartes de statistiques */}
          <div className="stats-grid-pro">
            <div className="stat-card-pro">
              <div className="stat-header">
                <div className="stat-icon">💼</div>
                <span className="stat-trend positive">+12%</span>
              </div>
              <div className="stat-content">
                <h3>{totalOffers}</h3>
                <p>Offres totales</p>
              </div>
              <div className="stat-footer">Mise à jour à l'instant</div>
            </div>

            <div className="stat-card-pro">
              <div className="stat-header">
                <div className="stat-icon">🟢</div>
                <span className="stat-trend positive">+5%</span>
              </div>
              <div className="stat-content">
                <h3>{activeOffers}</h3>
                <p>Offres actives</p>
              </div>
              <div className="stat-footer">En ligne maintenant</div>
            </div>

            <div className="stat-card-pro">
              <div className="stat-header">
                <div className="stat-icon">📬</div>
                <span className="stat-trend positive">+28%</span>
              </div>
              <div className="stat-content">
                <h3>{applicationsCount}</h3>
                <p>Candidatures reçues</p>
              </div>
              <div className="stat-footer">En attente de revue</div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="actions-grid-pro" style={{display: 'none'}}>
            {/* Cette section est cachée car non présente dans le CSS fourni */}
          </div>

          {/* Dernières offres avec boutons modifier/supprimer */}
          <div className="recent-section">
            <div className="section-header-pro">
              <h3>Vos offres récentes</h3>
              <button 
                className="secondary-btn"
                onClick={() => setActiveTab("offers")}
              >
                Voir tout
              </button>
            </div>
            
            {jobOffers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💼</div>
                <h3>Aucune offre créée</h3>
                <p>Commencez par créer votre première offre d'emploi</p>
                <button 
                  className="create-first-btn"
                  onClick={() => setShowCreateForm(true)}
                >
                  Créer ma première offre
                </button>
              </div>
            ) : (
              <div className="offers-grid-pro">
                {jobOffers.slice(0, 4).map((offer) => (
                  <div key={offer._id} className="offer-card-pro">
                    <div className="offer-header">
                      <h4>{offer.title}</h4>
                      <span className={`offer-status ${offer.status || 'active'}`}>
                        {offer.status === 'active' ? '🟢 Actif' : '🔴 Fermé'}
                      </span>
                    </div>
                    <p className="offer-desc">
                      {offer.description?.substring(0, 100)}...
                    </p>
                    <div className="offer-meta">
                      <span>📍 {offer.location}</span>
                      <span>💼 {offer.employmentType}</span>
                    </div>
                    <div className="offer-stats">
                      <div className="stat">
                        <strong>0</strong>
                        <span>Candidats</span>
                      </div>
                      <div className="stat">
                        <strong>0</strong>
                        <span>Entretiens</span>
                      </div>
                    </div>
                    {/* BOUTONS MODIFIER ET SUPPRIMER */}
                    <div className="offer-actions">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEditOffer(offer)}
                      >
                        <span>✏️</span>
                        Modifier
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteOffer(offer._id)}
                      >
                        <span>🗑️</span>
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section Candidatures récentes */}
          {applicationsCount > 0 && (
            <div className="recent-section">
              <div className="section-header-pro">
                <h3>Candidatures récentes</h3>
                <button 
                  className="secondary-btn"
                  onClick={() => navigate("/org/applications")}
                >
                  Voir toutes
                </button>
              </div>
              <div className="applications-preview">
                <div className="preview-card">
                  <div className="preview-icon">📬</div>
                  <div className="preview-content">
                    <h4>Vous avez {applicationsCount} candidature(s)</h4>
                    <p>Consultez et gérez les candidatures pour vos offres</p>
                    <button 
                      className="view-applications-btn"
                      onClick={() => navigate("/org/applications")}
                    >
                      Voir les candidatures
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal de création d'offre */}
      {showCreateForm && (
        <div className="modal-overlay-pro">
          <div className="modal-pro">
            <div className="modal-header-pro">
              <h2>Créer une nouvelle offre</h2>
              <button 
                className="close-btn-pro"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content-pro">
              <form onSubmit={handleCreateOffer}>
                <div className="form-grid-pro">
                  <div className="form-group-pro">
                    <label>Titre du poste *</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Développeur Frontend Senior"
                      value={newOffer.title}
                      onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group-pro">
                    <label>Type d'emploi</label>
                    <select 
                      value={newOffer.employmentType}
                      onChange={(e) => setNewOffer({...newOffer, employmentType: e.target.value})}
                    >
                      <option value="Full-time">Temps plein</option>
                      <option value="Part-time">Temps partiel</option>
                      <option value="Contract">Contrat</option>
                      <option value="Internship">Stage</option>
                    </select>
                  </div>
                  <div className="form-group-pro full-width">
                    <label>Description *</label>
                    <textarea 
                      rows="4"
                      placeholder="Décrivez le poste, les missions, les compétences requises..."
                      value={newOffer.description}
                      onChange={(e) => setNewOffer({...newOffer, description: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  <div className="form-group-pro">
                    <label>Lieu</label>
                    <select 
                      value={newOffer.location}
                      onChange={(e) => setNewOffer({...newOffer, location: e.target.value})}
                    >
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybride</option>
                      <option value="Onsite">Sur site</option>
                    </select>
                  </div>
                  <div className="form-group-pro">
                    <label>Compétences</label>
                    <input 
                      type="text" 
                      placeholder="React, Node.js, MongoDB"
                      value={newOffer.requiredSkills}
                      onChange={(e) => setNewOffer({...newOffer, requiredSkills: e.target.value})}
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-publish">
                    Publier l'offre
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification d'offre */}
      {showEditForm && (
        <div className="modal-overlay-pro">
          <div className="modal-pro">
            <div className="modal-header-pro">
              <h2>Modifier l'offre</h2>
              <button 
                className="close-btn-pro"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingOffer(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-content-pro">
              <form onSubmit={handleUpdateOffer}>
                <div className="form-grid-pro">
                  <div className="form-group-pro">
                    <label>Titre du poste *</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Développeur Frontend Senior"
                      value={newOffer.title}
                      onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group-pro">
                    <label>Type d'emploi</label>
                    <select 
                      value={newOffer.employmentType}
                      onChange={(e) => setNewOffer({...newOffer, employmentType: e.target.value})}
                    >
                      <option value="Full-time">Temps plein</option>
                      <option value="Part-time">Temps partiel</option>
                      <option value="Contract">Contrat</option>
                      <option value="Internship">Stage</option>
                    </select>
                  </div>
                  <div className="form-group-pro full-width">
                    <label>Description *</label>
                    <textarea 
                      rows="4"
                      placeholder="Décrivez le poste, les missions, les compétences requises..."
                      value={newOffer.description}
                      onChange={(e) => setNewOffer({...newOffer, description: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  <div className="form-group-pro">
                    <label>Lieu</label>
                    <select 
                      value={newOffer.location}
                      onChange={(e) => setNewOffer({...newOffer, location: e.target.value})}
                    >
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybride</option>
                      <option value="Onsite">Sur site</option>
                    </select>
                  </div>
                  <div className="form-group-pro">
                    <label>Compétences</label>
                    <input 
                      type="text" 
                      placeholder="React, Node.js, MongoDB"
                      value={newOffer.requiredSkills}
                      onChange={(e) => setNewOffer({...newOffer, requiredSkills: e.target.value})}
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingOffer(null);
                    }}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-publish">
                    Modifier l'offre
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {confirmDelete && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <div className="confirm-modal-icon">🗑️</div>
            <h3 className="confirm-modal-title">Confirmer la suppression</h3>
            <p className="confirm-modal-message">
              Êtes-vous sûr de vouloir supprimer cette offre ? 
              Cette action est irréversible.
            </p>
            <div className="confirm-modal-actions">
              <button className="confirm-btn-cancel" onClick={cancelDelete}>
                Annuler
              </button>
              <button className="confirm-btn-delete" onClick={confirmDeleteAction}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrgDashboard;