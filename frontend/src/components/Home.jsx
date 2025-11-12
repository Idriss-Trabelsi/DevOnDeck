// frontend/src/components/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>DevOnDeck</h1>
        
        <p className="home-description">
          La plateforme intelligente qui connecte les talents développeurs 
          avec les entreprises grâce à un matching de compétences avancé.
        </p>

        <div className="home-buttons">
          <button onClick={() => navigate("/login-admin")} className="home-btn">
             Espace Admin
          </button>

          <button onClick={() => navigate("/dev-auth")} className="home-btn">
             Espace Développeur
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;