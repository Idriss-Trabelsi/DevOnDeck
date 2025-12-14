// src/components/AdminProfile.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AdminProfile.css";

function AdminProfile() {
  const [admin, setAdmin] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const adminData = JSON.parse(localStorage.getItem("adminData"));
        if (!adminData || !adminData.id) {
          window.location.href = "/login-admin";
          return;
        }

        const res = await axios.get(`http://localhost:5000/api/admin/profile/${adminData.id}`);
        if (res.data.success) {
          setAdmin(res.data.data);
        } else {
          setMessage({ text: "Admin non trouvé", type: "error" });
        }
      } catch (error) {
        console.error(error);
        setMessage({ text: "Erreur lors du chargement du profil", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const adminData = JSON.parse(localStorage.getItem("adminData"));
      const res = await axios.put(`http://localhost:5000/api/admin/profile/${adminData.id}`, admin);
      if (res.data.success) {
        setAdmin(res.data.data);
        setMessage({ text: "Profil mis à jour avec succès ✅", type: "success" });
        setIsEditing(false);
        
        const updatedAdminData = { ...adminData, name: res.data.data.name, email: res.data.data.email };
        localStorage.setItem("adminData", JSON.stringify(updatedAdminData));
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: "Erreur lors de la mise à jour", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-wrapper">
          <div className="spinner"></div>
        </div>
        <p className="loading-text">Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="admin-profile-container">
      {/* Header */}
      <div className="profile-header">
        <div className="header-content">
          <div className="avatar-wrapper">
            <div className="avatar-gradient">
              {admin.name ? admin.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="admin-title">
              <h1>Profil Admin</h1>
              <p className="admin-subtitle">Devendeck Administration</p>
            </div>
          </div>
          <div className="header-badge">
            <span className="badge-icon">👨‍💻</span>
            <span className="badge-text">Administrateur Devendeck</span>
          </div>
        </div>
      </div>

      {/* Stats Cards cohérentes avec Devendeck */}
      <div className="stats-grid">
        <div className="stat-card stat-card-developers">
          <div className="stat-icon-wrapper">
            <div className="stat-icon">👨‍💻</div>
          </div>
          <div className="stat-content">
            <h3>Développeurs inscrits</h3>
            <div className="stat-value">154</div>
            <div className="stat-trend positive">+8 cette semaine</div>
          </div>
        </div>

        <div className="stat-card stat-card-users">
          <div className="stat-icon-wrapper">
            <div className="stat-icon">👥</div>
          </div>
          <div className="stat-content">
            <h3>Utilisateurs totaux</h3>
            <div className="stat-value">287</div>
            <div className="stat-trend positive">+12% croissance</div>
          </div>
        </div>

        <div className="stat-card stat-card-projects">
          <div className="stat-icon-wrapper">
            <div className="stat-icon">📁</div>
          </div>
          <div className="stat-content">
            <h3>Projets publiés</h3>
            <div className="stat-value">342</div>
            <div className="stat-trend positive">+24 nouveaux</div>
          </div>
        </div>

        <div className="stat-card stat-card-verifications">
          <div className="stat-icon-wrapper">
            <div className="stat-icon">✅</div>
          </div>
          <div className="stat-content">
            <h3>Vérifications</h3>
            <div className="stat-value">23</div>
            <div className="stat-trend warning">En attente</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-wrapper">
        <div className="profile-section">
          <div className="section-header">
            <h2>Informations du profil</h2>
            {!isEditing && (
              <button 
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                <span className="btn-icon">✏️</span>
                Modifier le profil
              </button>
            )}
          </div>

          {message.text && (
            <div className={`message-banner ${message.type}`}>
              <span className="banner-icon">
                {message.type === "success" ? "✅" : "⚠️"}
              </span>
              {message.text}
            </div>
          )}

          <div className="profile-card">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="input-group">
                  <label className="input-label">
                    <span className="input-icon">👤</span>
                    Nom complet
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={admin.name}
                    onChange={handleChange}
                    required
                    className="modern-input"
                    placeholder="Votre nom complet"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">
                    <span className="input-icon">✉️</span>
                    Adresse email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={admin.email}
                    onChange={handleChange}
                    required
                    className="modern-input"
                    placeholder="votre@email.com"
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => {
                      setIsEditing(false);
                      setMessage({ text: "", type: "" });
                    }}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="save-btn">
                    <span className="btn-icon">💾</span>
                    Sauvegarder
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-info">
                <div className="info-item">
                  <div className="info-label">
                    <span className="info-icon">👤</span>
                    Nom complet
                  </div>
                  <div className="info-value">{admin.name}</div>
                </div>
                
                <div className="info-item">
                  <div className="info-label">
                    <span className="info-icon">✉️</span>
                    Adresse email
                  </div>
                  <div className="info-value">{admin.email}</div>
                </div>
                
                <div className="info-item">
                  <div className="info-label">
                    <span className="info-icon">🔑</span>
                    Rôle
                  </div>
                  <div className="info-value">Administrateur Devendeck</div>
                </div>
                
                <div className="info-item">
                  <div className="info-label">
                    <span className="info-icon">📅</span>
                    Membre depuis
                  </div>
                  <div className="info-value">15 Mars 2024</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar-section">
          <div className="sidebar-card">
            <h3 className="sidebar-title">
              <span className="title-icon">⚡</span>
              Actions rapides
            </h3>
            <div className="quick-actions">
              <button className="quick-action" onClick={() => window.location.href = "/admin/developers"}>
                <span className="action-icon">👨‍💻</span>
                <div className="action-content">
                  <span className="action-title">Gérer développeurs</span>
                  <span className="action-desc">154 développeurs inscrits</span>
                </div>
                <span className="action-arrow">→</span>
              </button>
              
              <button className="quick-action" onClick={() => window.location.href = "/admin/verifications"}>
                <span className="action-icon">✅</span>
                <div className="action-content">
                  <span className="action-title">Vérifications</span>
                  <span className="action-desc">23 demandes en attente</span>
                </div>
                <span className="action-arrow">→</span>
              </button>
              
              <button className="quick-action" onClick={() => window.location.href = "/admin/projects"}>
                <span className="action-icon">📁</span>
                <div className="action-content">
                  <span className="action-title">Projets</span>
                  <span className="action-desc">342 projets publiés</span>
                </div>
                <span className="action-arrow">→</span>
              </button>
              
              <button className="quick-action" onClick={() => window.location.href = "/admin/settings"}>
                <span className="action-icon">⚙️</span>
                <div className="action-content">
                  <span className="action-title">Paramètres</span>
                  <span className="action-desc">Configurer la plateforme</span>
                </div>
                <span className="action-arrow">→</span>
              </button>
            </div>
          </div>

          <div className="sidebar-card">
            <h3 className="sidebar-title">
              <span className="title-icon">📊</span>
              Activité récente
            </h3>
            <div className="activity-list">
              <div className="activity-item new-user">
                <div className="activity-icon">👨‍💻</div>
                <div className="activity-content">
                  <p>Nouveau développeur inscrit</p>
                  <span className="activity-time">Il y a 15 minutes</span>
                </div>
              </div>
              <div className="activity-item verification">
                <div className="activity-icon">✅</div>
                <div className="activity-content">
                  <p>Compte développeur vérifié</p>
                  <span className="activity-time">Il y a 2 heures</span>
                </div>
              </div>
              <div className="activity-item new-project">
                <div className="activity-icon">📁</div>
                <div className="activity-content">
                  <p>Projet React publié</p>
                  <span className="activity-time">Il y a 4 heures</span>
                </div>
              </div>
              <div className="activity-item system">
                <div className="activity-icon">⚙️</div>
                <div className="activity-content">
                  <p>Sauvegarde système effectuée</p>
                  <span className="activity-time">Il y a 1 jour</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;