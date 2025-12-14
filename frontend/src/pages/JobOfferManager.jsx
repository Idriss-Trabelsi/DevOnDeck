// frontend/src/components/JobOfferManager.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/JobOfferManager.css";

export default function JobOfferManager() {
  const navigate = useNavigate();
  const [jobOffers, setJobOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orgData, setOrgData] = useState(null);
  
  // États pour la création/modification
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requiredSkills: "",
    location: "Remote",
    employmentType: "Full-time",
    salaryRange: { min: "", max: "" }
  });

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const data = JSON.parse(localStorage.getItem("organizationData"));
    const token = localStorage.getItem("organizationToken");
    
    if (!data || !token) {
      window.location.href = "/unified-auth";
      return;
    }

    setOrgData(data);
    await fetchJobOffers(data.id);
  };

  const fetchJobOffers = async (orgId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/joboffers/organization/${orgId}`);
      const data = await res.json();
      
      if (data.success) {
        setJobOffers(data.jobOffers || []);
      }
    } catch (error) {
      console.error("Erreur chargement offres:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingOffer 
        ? `http://localhost:5000/api/joboffers/${editingOffer._id}`
        : "http://localhost:5000/api/joboffers";
      
      const method = editingOffer ? "PUT" : "POST";
      
      const payload = {
        ...formData,
        organizationId: orgData.id,
        requiredSkills: formData.requiredSkills.split(',').map(skill => skill.trim()).filter(skill => skill !== ""),
        salaryRange: {
          min: parseInt(formData.salaryRange.min) || 0,
          max: parseInt(formData.salaryRange.max) || 0
        }
      };
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert(editingOffer ? "✅ Offre modifiée !" : "✅ Offre créée !");
        setShowForm(false);
        setEditingOffer(null);
        setFormData({
          title: "",
          description: "",
          requiredSkills: "",
          location: "Remote",
          employmentType: "Full-time",
          salaryRange: { min: "", max: "" }
        });
        fetchJobOffers(orgData.id);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("❌ Erreur lors de l'opération");
    }
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description,
      requiredSkills: offer.requiredSkills?.join(', ') || "",
      location: offer.location,
      employmentType: offer.employmentType,
      salaryRange: {
        min: offer.salaryRange?.min || "",
        max: offer.salaryRange?.max || ""
      }
    });
    setShowForm(true);
  };

  const handleDelete = async (offerId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/joboffers/${offerId}`, {
          method: "DELETE"
        });
        
        const data = await res.json();
        
        if (data.success) {
          alert("🗑️ Offre supprimée !");
          fetchJobOffers(orgData.id);
        }
      } catch (error) {
        console.error("Erreur suppression:", error);
      }
    }
  };

  const handleViewMatching = (offerId) => {
    navigate(`/job-offers/${offerId}/matching`);
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="job-manager-container">
      <header className="manager-header">
        <h1>💼 Gestion des offres d'emploi</h1>
        <button 
          className="create-btn"
          onClick={() => {
            setEditingOffer(null);
            setShowForm(true);
          }}
        >
          + Nouvelle offre
        </button>
      </header>

      {/* Formulaire de création/modification */}
      {showForm && (
        <div className="form-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingOffer ? "Modifier l'offre" : "Créer une nouvelle offre"}</h2>
              <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Titre du poste *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Ex: Développeur Full-Stack Senior"
                  />
                </div>
                
                <div className="form-group">
                  <label>Type d'emploi</label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleInputChange}
                  >
                    <option value="Full-time">Temps plein</option>
                    <option value="Part-time">Temps partiel</option>
                    <option value="Contract">Contrat</option>
                    <option value="Internship">Stage</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Lieu</label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybride</option>
                    <option value="Onsite">Sur site</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Salaire minimum (€)</label>
                  <input
                    type="number"
                    name="salaryRange.min"
                    value={formData.salaryRange.min}
                    onChange={handleInputChange}
                    placeholder="Ex: 40000"
                  />
                </div>
                
                <div className="form-group">
                  <label>Salaire maximum (€)</label>
                  <input
                    type="number"
                    name="salaryRange.max"
                    value={formData.salaryRange.max}
                    onChange={handleInputChange}
                    placeholder="Ex: 60000"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Compétences recherchées *</label>
                  <input
                    type="text"
                    name="requiredSkills"
                    value={formData.requiredSkills}
                    onChange={handleInputChange}
                    required
                    placeholder="React, Node.js, MongoDB, TypeScript (séparées par des virgules)"
                  />
                  <small>Ces compétences seront utilisées pour le matching</small>
                </div>
                
                <div className="form-group full-width">
                  <label>Description détaillée *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="6"
                    placeholder="Décrivez le poste, les missions, l'environnement de travail..."
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
                  Annuler
                </button>
                <button type="submit" className="submit-btn">
                  {editingOffer ? "Modifier l'offre" : "Publier l'offre"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste des offres */}
      <div className="offers-table">
        {jobOffers.length === 0 ? (
          <div className="empty-state">
            <p>Aucune offre créée</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Titre</th>
                <th>Compétences</th>
                <th>Statut</th>
                <th>Localisation</th>
                <th>Type</th>
                <th>Salaire</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobOffers.map((offer) => (
                <tr key={offer._id}>
                  <td>
                    <strong>{offer.title}</strong>
                    <small>{new Date(offer.createdAt).toLocaleDateString()}</small>
                  </td>
                  <td>
                    <div className="skills-cell">
                      {offer.requiredSkills?.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="skill-chip">{skill}</span>
                      ))}
                      {offer.requiredSkills?.length > 3 && (
                        <span className="skill-chip more">+{offer.requiredSkills.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${offer.status}`}>
                      {offer.status === 'active' ? '🟢 Actif' : 
                       offer.status === 'closed' ? '🔴 Fermé' : '📝 Brouillon'}
                    </span>
                  </td>
                  <td>{offer.location}</td>
                  <td>{offer.employmentType}</td>
                  <td>
                    {offer.salaryRange?.min > 0 || offer.salaryRange?.max > 0
                      ? `${offer.salaryRange?.min || '?'} - ${offer.salaryRange?.max || '?'}€`
                      : 'Non spécifié'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn view"
                        onClick={() => handleViewMatching(offer._id)}
                        title="Voir le matching"
                      >
                        🎯
                      </button>
                      <button 
                        className="action-btn edit"
                        onClick={() => handleEdit(offer)}
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDelete(offer._id)}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}