import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AdminDevelopersList.css";

export default function AdminDevelopersList() {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDev, setEditingDev] = useState(null); // Développeur en cours de modification
  const [message, setMessage] = useState("");

  const fetchDevelopers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/developers");
      if (res.data.success) {
        setDevelopers(res.data.data);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors du chargement des développeurs");
    }
  };

  useEffect(() => {
    fetchDevelopers();
  }, []);

  // 🔹 Modifier un développeur
  const handleEditChange = (e) => {
    setEditingDev({ ...editingDev, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `http://localhost:5000/api/admin/developers/${editingDev._id}`,
        editingDev
      );
      if (res.data.success) {
        setMessage(res.data.message);
        setEditingDev(null);
        fetchDevelopers();
      }
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de la mise à jour");
    }
  };

  // 🔹 Supprimer un développeur
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce développeur ?")) return;

    try {
      const res = await axios.delete(`http://localhost:5000/api/admin/developers/${id}`);
      if (res.data.success) {
        setMessage(res.data.message);
        fetchDevelopers();
      }
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de la suppression");
    }
  };

  if (loading) return <div>Chargement des développeurs...</div>;

  return (
    <div className="admin-developers-container">
      <h1>Liste des Développeurs</h1>
      {message && <p className="message">{message}</p>}

      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Compétences</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {developers.map((dev) => (
            <tr key={dev._id}>
              <td>{dev.name}</td>
              <td>{dev.email}</td>
              <td>{dev.skills}</td>
              <td>
                <button onClick={() => setEditingDev(dev)}>Modifier</button>
                <button onClick={() => handleDelete(dev._id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Formulaire de modification */}
      {editingDev && (
        <form className="edit-form" onSubmit={handleUpdate}>
          <h2>Modifier le développeur</h2>
          <label>Nom :</label>
          <input
            name="name"
            value={editingDev.name}
            onChange={handleEditChange}
            required
          />

          <label>Email :</label>
          <input
            name="email"
            type="email"
            value={editingDev.email}
            onChange={handleEditChange}
            required
          />

          <label>Compétences :</label>
          <input
            name="skills"
            value={editingDev.skills}
            onChange={handleEditChange}
          />

          <button type="submit">💾 Enregistrer</button>
          <button type="button" onClick={() => setEditingDev(null)}>❌ Annuler</button>
        </form>
      )}
    </div>
  );
}
