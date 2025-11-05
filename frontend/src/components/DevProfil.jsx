// frontend/src/components/DevProfile.jsx
import React, { useEffect, useState } from "react";
import "../styles/DevProfil.css";
export default function DevProfile() {
  const [dev, setDev] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiBase = "http://localhost:5000/api";

  useEffect(() => {
    const devLocal = JSON.parse(localStorage.getItem("devData"));
    const token = localStorage.getItem("devToken");
    if (!devLocal || !token) {
      window.location.href = "/developer/login";
      return;
    }

    // fetch profil from backend (saute si pas trouvé)
    fetch(`${apiBase}/dev/profile/${devLocal.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) {
          setDev(data.data);
        } else {
          // fallback to local stored data
          setDev(devLocal);
        }
      })
      .catch(() => setDev(devLocal))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{textAlign:"center", marginTop:40}}>Chargement...</div>;

  if (!dev) return <div style={{textAlign:"center", marginTop:40}}>Profil introuvable</div>;

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 20 }}>
      <div style={{ background:"#fff", padding:20, borderRadius:8, boxShadow:"0 6px 20px rgba(0,0,0,0.06)" }}>
        <h1>👨‍💻 Mon profil</h1>
        <p><strong>Nom :</strong> {dev.name}</p>
        <p><strong>Email :</strong> {dev.email}</p>
        <p><strong>Compétences :</strong> {dev.skills || "Non renseignées"}</p>
        <div style={{ marginTop: 20 }}>
          <button onClick={() => { localStorage.removeItem("devData"); localStorage.removeItem("devToken"); window.location.href = "/"; }}
            style={{ padding:"10px 14px", background:"#ef4444", color:"white", border:"none", borderRadius:8 }}>
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
