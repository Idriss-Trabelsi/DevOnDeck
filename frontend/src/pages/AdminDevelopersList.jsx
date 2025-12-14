import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AdminDevelopersList.css";

export default function AdminDevelopersList() {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDev, setEditingDev] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const apiBase = "http://localhost:5000/api";

  // 🔹 Récupérer tous les développeurs
  const fetchDevelopers = async () => {
    try {
      const res = await axios.get(`${apiBase}/admin/developers`);
      if (res.data.success) {
        console.log("📋 Développeurs récupérés:", res.data.data);
        setDevelopers(res.data.data);
      }
    } catch (err) {
      console.error("Erreur fetchDevelopers:", err);
      showMessage("Erreur lors du chargement des développeurs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevelopers();
  }, []);

  // 🔹 Afficher un message fluide
  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  // 🔹 Modifier un développeur
  const handleEditChange = (e) => {
    setEditingDev({ ...editingDev, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${apiBase}/admin/developers/${editingDev._id}`, editingDev);
      if (res.data.success) {
        showMessage(res.data.message, "success");
        setEditingDev(null);
        fetchDevelopers();
      }
    } catch (err) {
      console.error("Erreur mise à jour:", err);
      showMessage("Erreur lors de la mise à jour", "error");
    }
  };

  // 🔹 Supprimer un développeur après confirmation
  const handleDeleteConfirmed = async (id) => {
    try {
      const res = await axios.delete(`${apiBase}/admin/developers/${id}`);
      if (res.data.success) showMessage(res.data.message, "success");
      fetchDevelopers();
    } catch (err) {
      console.error("Erreur suppression:", err);
      showMessage("Erreur lors de la suppression", "error");
    } finally {
      setConfirmDelete(null);
    }
  };

  if (loading) return <div style={{ textAlign: "center", marginTop: 40 }}>Chargement...</div>;

  return (
    <div className="admin-developers-container">
      <h1>Liste des Développeurs</h1>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Compétences</th>
              <th>Bio</th>
              <th>Téléphone</th>
              <th>Adresse</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {developers.map((dev) => (
              <tr key={dev._id}>
                <td>{dev.name}</td>
                <td>{dev.email}</td>
                <td>{dev.skills || "—"}</td>
                <td className="bio-cell">
                  {dev.bio ? (
                    <div className="bio-preview">
                      {dev.bio.length > 50 ? `${dev.bio.substring(0, 50)}...` : dev.bio}
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
                <td>{dev.phone || "—"}</td>
                <td>{dev.address || "—"}</td>

                <td className="actions-cell">
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => setEditingDev({ ...dev })}
                  >
                    Modifier
                  </button>
                  <button 
                    className="btn btn-danger btn-sm" 
                    onClick={() => setConfirmDelete(dev._id)}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formulaire de modification */}
      {editingDev && (
        <div className="edit-form-container">
          <h2>Modifier le développeur</h2>
          <form onSubmit={handleUpdate} className="edit-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Nom :</label>
                <input
                  name="name"
                  value={editingDev.name}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email :</label>
                <input
                  name="email"
                  type="email"
                  value={editingDev.email}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Compétences :</label>
                <input
                  name="skills"
                  value={editingDev.skills || ""}
                  onChange={handleEditChange}
                  placeholder="React, Node.js, Python..."
                />
              </div>

              <div className="form-group full-width">
                <label>Bio :</label>
                <textarea
                  name="bio"
                  value={editingDev.bio || ""}
                  onChange={handleEditChange}
                  placeholder="Bio du développeur..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Numéro de téléphone :</label>
                <input
                  name="phone"
                  value={editingDev.phone || ""}
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-group">
                <label>Adresse :</label>
                <input
                  name="address"
                  value={editingDev.address || ""}
                  onChange={handleEditChange}
                />
              </div>
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn btn-success">
                Enregistrer
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setEditingDev(null)}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirmation suppression */}
      {confirmDelete && (
        <div className="confirm-delete-backdrop">
          <div className="confirm-delete">
            <p>Voulez-vous vraiment supprimer ce développeur ?</p>
            <div className="confirm-delete-buttons">
              <button 
                className="btn btn-danger" 
                onClick={() => handleDeleteConfirmed(confirmDelete)}
              >
                Confirmer
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setConfirmDelete(null)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}