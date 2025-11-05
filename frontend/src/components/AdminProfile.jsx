// src/components/AdminProfile.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AdminProfile.css";

function AdminProfile() {
  const [admin, setAdmin] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Récupérer l'ID de l'admin dans localStorage
        const adminData = JSON.parse(localStorage.getItem("adminData"));
        if (!adminData || !adminData.id) {
          window.location.href = "/login-admin"; // redirection si non connecté
          return;
        }

        const res = await axios.get(`http://localhost:5000/api/admin/profile/${adminData.id}`);
        if (res.data.success) {
          setAdmin(res.data.data);
        } else {
          setMessage("Admin non trouvé");
        }
      } catch (error) {
        console.error(error);
        setMessage("Erreur lors du chargement du profil");
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
        setMessage("Profil mis à jour ✅");
      }
    } catch (error) {
      console.error(error);
      setMessage("Erreur lors de la mise à jour");
    }
  };

  if (loading) return <div>Chargement du profil...</div>;

  return (
    <div className="admin-profile-container">
      <h1>⚙️ Gestion Profil Admin</h1>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit} className="admin-profile-form">
        <label>Nom :</label>
        <input
          type="text"
          name="name"
          value={admin.name}
          onChange={handleChange}
          required
        />

        <label>Email :</label>
        <input
          type="email"
          name="email"
          value={admin.email}
          onChange={handleChange}
          required
        />

        <button type="submit">💾 Enregistrer</button>
      </form>
    </div>
  );
}

export default AdminProfile;
