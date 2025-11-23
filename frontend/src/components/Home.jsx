// src/components/Home.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: "🔮",
      title: "Matching Algorithmique",
      description: "Notre IA analyse 50+ paramètres pour des matches parfaits entre talents et entreprises"
    },
    {
      icon: "🚀",
      title: "Recrutement 3x Plus Rapide",
      description: "Réduisez votre temps de recrutement de 70% avec notre plateforme intelligente"
    },
    {
      icon: "💎",
      title: "Talents Vérifiés",
      description: "Tous nos développeurs passent par un processus de vérification rigoureux"
    },
    {
      icon: "📊",
      title: "Analytics Avancés",
      description: "Dashboard complet avec métriques de performance et tendances du marché"
    }
  ];

  const stats = [
    { number: "98%", label: "Satisfaction Clients", suffix: "+" },
    { number: "3.2x", label: "Efficacité Recrutement", suffix: "" },
    { number: "1500", label: "Matches Réussis", suffix: "+" },
    { number: "24h", label: "Temps Moyen de Match", suffix: "" }
  ];

  return (
    <div className="home-container">
      {/* Effet de souris interactif */}
      <div 
        className="mouse-follower"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`
        }}
      ></div>

      {/* Background Gradients Animés */}
      <div className="gradient-bg">
        <div className="gradient gradient-1"></div>
        <div className="gradient gradient-2"></div>
        <div className="gradient gradient-3"></div>
        <div className="grid-overlay"></div>
      </div>

      {/* Hero Section Élégante */}
      <section className="hero-section">
        <div className="hero-container">
          {/* Badge Premium */}
          <div className="premium-badge">
            <div className="badge-sparkle">✨</div>
            <span>Plateforme Elite de Matching Tech</span>
            <div className="badge-glow"></div>
          </div>

          {/* Titre Principal */}
          <div className="hero-title-container">
            <h1 className="hero-main-title">
              <span className="title-line">Where Exceptional</span>
              <span className="title-line">
                <span className="title-gradient">Tech Talent</span>
              </span>
              <span className="title-line">Meets Visionary</span>
              <span className="title-line">
                <span className="title-gradient">Companies</span>
              </span>
            </h1>
            
            <div className="title-underline">
              <div className="underline-bar"></div>
              <div className="underline-dot"></div>
            </div>
          </div>

          {/* Description Sophistiquée */}
          <div className="hero-description-container">
            <p className="hero-subtitle">
              DevOnDeck redéfinit le recrutement tech avec une plateforme intelligente 
              qui transforme la manière dont les talents et les opportunités se rencontrent
            </p>
            <div className="description-divider">
              <div className="divider-line"></div>
              <div className="divider-diamond">◆</div>
              <div className="divider-line"></div>
            </div>
          </div>

          {/* CTA Buttons Élégants */}
          <div className="hero-actions">
            <button 
              className="cta-btn cta-primary"
              onClick={() => navigate("/login-admin")}
            >
              <span className="btn-shine"></span>
              <span className="btn-content">
                <span className="btn-icon">🏢</span>
                <span className="btn-text">Espace Entreprise</span>
                <span className="btn-arrow">↗</span>
              </span>
            </button>

            <button 
              className="cta-btn cta-secondary"
              onClick={() => navigate("/dev-auth")}
            >
              <span className="btn-content">
                <span className="btn-icon">👨‍💻</span>
                <span className="btn-text">Espace Talent</span>
                <span className="btn-arrow">↗</span>
              </span>
            </button>
          </div>

          {/* Stats Élégantes */}
          <div className="premium-stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-content">
                  <div className="stat-number">
                    {stat.number}<span className="stat-suffix">{stat.suffix}</span>
                  </div>
                  <div className="stat-label">{stat.label}</div>
                </div>
                {index < stats.length - 1 && <div className="stat-divider"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Visual Élégant */}
        <div className="hero-visual">
          <div className="floating-orb orb-1">
            <div className="orb-core"></div>
            <div className="orb-glow"></div>
          </div>
          <div className="floating-orb orb-2">
            <div className="orb-core"></div>
            <div className="orb-glow"></div>
          </div>
          
          <div className="connection-lines">
            <div className="line line-1"></div>
            <div className="line line-2"></div>
            <div className="line line-3"></div>
          </div>
        </div>
      </section>

      {/* Features Section Luxueuse */}
      <section className="features-section">
        <div className="section-header">
          <div className="section-badge">Excellence</div>
          <h2 className="section-title">
            Pourquoi les Leaders Tech
            <span className="title-accent"> Nous Choisissent</span>
          </h2>
          <p className="section-subtitle">
            Une expérience sur-mesure conçue pour les professionnels exigeants
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-header">
                <div className="feature-icon-wrapper">
                  <span className="feature-icon">{feature.icon}</span>
                  <div className="icon-glow"></div>
                </div>
                <div className="feature-number">0{index + 1}</div>
              </div>
              
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              
              <div className="feature-hover">
                <div className="hover-glow"></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final Élégant */}
      <section className="final-cta">
        <div className="cta-container">
          <div className="cta-background">
            <div className="cta-glow"></div>
          </div>
          
          <div className="cta-content">
            <h2 className="cta-title">
              Prêt à Élever 
              <span className="cta-gradient"> Votre Équipe</span> ?
            </h2>
            <p className="cta-subtitle">
              Rejoignez les entreprises innovantes qui transforment leur recrutement tech
            </p>
            
            <div className="cta-actions">
              <button 
                className="final-cta-btn"
                onClick={() => navigate("/dev-auth")}
              >
                <span className="final-btn-shine"></span>
                <span className="final-btn-content">
                  <span>Démarrer l'Expérience</span>
                  <span className="final-arrow">⟶</span>
                </span>
              </button>
              
              <button className="demo-cta-btn">
                <span>Voir la Démo Exclusive</span>
                <span className="demo-icon">🎬</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
