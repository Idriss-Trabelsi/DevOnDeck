import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DevDashboard.css";

function DevDashboard() {
  const navigate = useNavigate();
  const [devData, setDevData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    skills: ""
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAuth = () => {
      const data = JSON.parse(localStorage.getItem("developerData"));
      const token = localStorage.getItem("developerToken");
      
      if (!data || !token) {
        window.location.href = "/unified-auth";
        return;
      }

      setDevData(data);
      setEditedData(data);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedData(devData);
    } else {
      setEditedData(devData);
    }
    setIsEditing(!isEditing);
    setMessage("");
    setError("");
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("developerToken");
      
      // Vérifier que l'ID du développeur existe
      if (!devData.id) {
        setError("Erreur: ID du développeur non trouvé");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/dev/profile/${devData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editedData.name,
          email: editedData.email,
          skills: editedData.skills,
          bio: editedData.bio,
          phone: editedData.phone,
          address: editedData.address
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }

      if (data.success) {
        // Mettre à jour les données locales ET le localStorage
        const updatedData = { ...data.developer };
        setDevData(updatedData);
        localStorage.setItem("developerData", JSON.stringify(updatedData));
        
        setMessage("✅ Profil mis à jour avec succès !");
        setIsEditing(false);
        
        // Effacer le message après 3 secondes
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error("Erreur mise à jour:", err);
      setError(err.message || "Erreur lors de la mise à jour du profil");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleCancel = () => {
    setEditedData(devData);
    setIsEditing(false);
    setMessage("");
    setError("");
  };

  const handleViewProfile = () => {
    navigate("/developer/profile");
  };

  const handleLogout = () => {
    localStorage.removeItem("developerData");
    localStorage.removeItem("developerToken");
    window.location.href = "/";
  };

  if (loading) return <div className="loading">Chargement de votre espace développeur...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1> Tableau de bord Développeur</h1>
        <div className="header-buttons">
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Se déconnecter
          </button>
        </div>
      </header>

      <section className="profile-section">
        <div className="section-header">
          <h2>Mon Profil</h2>
          <button 
            className={`edit-toggle-btn ${isEditing ? 'editing' : ''}`}
            onClick={handleEditToggle}
          >
            {isEditing ? '👁️ Visualiser' : '✏️ Modifier le profil'}
          </button>
        </div>

        {/* Messages */}
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
        
        <div className="profile-info">
          {/* Nom */}
          <div className="info-card">
            <strong>Nom :</strong> 
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={editedData.name || ''}
                onChange={handleInputChange}
                className="edit-input"
                placeholder="Votre nom complet"
              />
            ) : (
              <span>{devData.name || "Non renseigné"}</span>
            )}
          </div>
          
          {/* Email */}
          <div className="info-card">
            <strong>Email :</strong> 
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={editedData.email || ''}
                onChange={handleInputChange}
                className="edit-input"
                placeholder="votre@email.com"
              />
            ) : (
              <span>{devData.email || "Non renseigné"}</span>
            )}
          </div>
          
          {/* Téléphone */}
          <div className="info-card">
            <strong>Téléphone :</strong> 
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={editedData.phone || ''}
                onChange={handleInputChange}
                className="edit-input"
                placeholder="+33 1 23 45 67 89"
              />
            ) : (
              <span>{devData.phone || "Non renseigné"}</span>
            )}
          </div>
          
          {/* Adresse */}
          <div className="info-card">
            <strong>Adresse :</strong> 
            {isEditing ? (
              <input
                type="text"
                name="address"
                value={editedData.address || ''}
                onChange={handleInputChange}
                className="edit-input"
                placeholder="Votre adresse"
              />
            ) : (
              <span>{devData.address || "Non renseignée"}</span>
            )}
          </div>
          
          {/* Bio */}
          <div className="info-card full-width">
            <strong>Bio :</strong> 
            {isEditing ? (
              <textarea
                name="bio"
                value={editedData.bio || ''}
                onChange={handleInputChange}
                className="edit-textarea"
                placeholder="Décrivez-vous en quelques mots... Parlez de votre expérience, vos passions, vos objectifs professionnels."
                rows="4"
              />
            ) : (
              <span>{devData.bio || "Aucune bio renseignée"}</span>
            )}
          </div>
          
          {/* Compétences */}
          <div className="info-card full-width">
            <strong>Compétences :</strong> 
            {isEditing ? (
              <div>
                <textarea
                  name="skills"
                  value={editedData.skills || ''}
                  onChange={handleInputChange}
                  className="edit-textarea"
                  placeholder="JavaScript, React, Node.js, Python, HTML, CSS... (séparées par des virgules)"
                  rows="3"
                />
                <div className="skills-hint">
                  💡 Séparez vos compétences par des virgules
                </div>
              </div>
            ) : (
              <div className="skills-display">
                {devData.skills ? (
                  <div className="skills-container">
                    {devData.skills.split(',').map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span>Aucune compétence renseignée</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions d'édition */}
        {isEditing && (
          <div className="edit-actions">
            <button className="save-btn" onClick={handleSave}>
              💾 Sauvegarder les modifications
            </button>
            <button className="cancel-btn" onClick={handleCancel}>
              ❌ Annuler
            </button>
          </div>
        )}

        {/* Actions rapides */}
        <div className="dashboard-actions">
          <h3>Actions rapides</h3>
          <div className="action-buttons">
            <button className="action-btn" onClick={handleViewProfile}>
              👀 Voir mon profil public
            </button>
            <button className="action-btn" onClick={() => navigate("/job-offers")}>
              💼 Voir les offres d'emploi
            </button>
            <button className="action-btn">
              📊 Mes statistiques
            </button>
            <button className="action-btn">
              🔔 Paramètres de notifications
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DevDashboard;