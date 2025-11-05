// frontend/src/components/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1>🌐 Bienvenue sur DevOnDeck</h1>
      <p>Choisissez votre espace :</p>

      <div className="home-buttons">
        <button onClick={() => navigate("/login-admin")} className="home-btn">
          Espace Admin
        </button>

        <button onClick={() => navigate("/dev-auth")} className="home-btn">
          Espace Développeur
        </button>
      </div>
    </div>
  );
}

export default Home;




