import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DevProfil.css";

export default function DevProfile() {
  const [dev, setDev] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");
  const navigate = useNavigate();

  useEffect(() => {
    const devLocal = JSON.parse(localStorage.getItem("developerData"));
    const token = localStorage.getItem("developerToken");
    
    if (!devLocal || !token) {
      window.location.href = "/unified-auth";
      return;
    }

    // Simuler des données supplémentaires pour la démo
    const enhancedDev = {
      ...devLocal,
      github: "github.com/" + devLocal.name?.toLowerCase().replace(/\s/g, ''),
      linkedin: "linkedin.com/in/" + devLocal.name?.toLowerCase().replace(/\s/g, ''),
      experience: "3+ années",
      projects: [
        "E-commerce React/Node.js",
        "API REST avec Express",
        "Application mobile React Native"
      ],
      availability: "Disponible pour mission",
      hourlyRate: "70€/h",
      languages: ["Français", "Anglais", "Espagnol"]
    };

    setDev(enhancedDev);
    setLoading(false);
  }, []);

  const handleEditProfile = () => {
    navigate("/developer/dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("developerData");
    localStorage.removeItem("developerToken");
    window.location.href = "/";
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(dev.email);
    // Vous pourriez ajouter un toast ici
    alert("Email copié dans le presse-papier !");
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-container">
          <div className="spinner-ring"></div>
          <div className="spinner-dot"></div>
        </div>
        <p className="loading-text">Chargement de votre profil...</p>
      </div>
    );
  }

  if (!dev) {
    return (
      <div className="error-screen">
        <div className="error-icon">⚠️</div>
        <h2>Profil introuvable</h2>
        <p>Veuillez vous reconnecter</p>
        <button className="retry-btn" onClick={() => window.location.reload()}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="dev-profile-container">
      {/* Background Elements */}
      <div className="bg-grid"></div>
      <div className="bg-glow"></div>

      <div className="profile-wrapper">
        {/* Header avec avatar */}
        <div className="profile-header">
          <div className="avatar-section">
            <div className="avatar-wrapper">
              <div className="avatar-circle">
                {dev.name ? dev.name.charAt(0).toUpperCase() : "D"}
              </div>
              <div className="avatar-status available"></div>
            </div>
            <div className="dev-title">
              <h1>{dev.name}</h1>
              <p className="dev-role">Développeur Full-Stack</p>
              <div className="dev-tags">
                <span className="dev-tag">💻 {dev.experience}</span>
                <span className="dev-tag">📍 {dev.availability}</span>
                <span className="dev-tag">💰 {dev.hourlyRate}</span>
              </div>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="action-btn contact-btn" onClick={handleCopyEmail}>
              <span className="btn-icon">📧</span>
              Contact
            </button>
            <button className="action-btn edit-btn" onClick={handleEditProfile}>
              <span className="btn-icon">⚙️</span>
              Éditer
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="tabs-container">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === "personal" ? "active" : ""}`}
              onClick={() => setActiveTab("personal")}
            >
              <span className="tab-icon">👤</span>
              Personnel
            </button>
            <button 
              className={`tab ${activeTab === "skills" ? "active" : ""}`}
              onClick={() => setActiveTab("skills")}
            >
              <span className="tab-icon">🚀</span>
              Compétences
            </button>
            <button 
              className={`tab ${activeTab === "projects" ? "active" : ""}`}
              onClick={() => setActiveTab("projects")}
            >
              <span className="tab-icon">💼</span>
              Projets
            </button>
          </div>
          <div className="tab-indicator"></div>
        </div>

        {/* Main Content */}
        <div className="profile-content">
          {/* Sidebar Info */}
          <div className="profile-sidebar">
            <div className="sidebar-card">
              <h3>📞 Contact</h3>
              <div className="contact-info">
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <div>
                    <p className="contact-label">Email</p>
                    <p className="contact-value">{dev.email}</p>
                  </div>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">📱</span>
                  <div>
                    <p className="contact-label">Téléphone</p>
                    <p className="contact-value">{dev.phone || "Non spécifié"}</p>
                  </div>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">📍</span>
                  <div>
                    <p className="contact-label">Localisation</p>
                    <p className="contact-value">{dev.address || "Non spécifiée"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sidebar-card">
              <h3>🔗 Réseaux</h3>
              <div className="social-links">
                <a href={`https://${dev.github}`} className="social-link github" target="_blank" rel="noopener noreferrer">
                  <span className="social-icon">🐙</span>
                  GitHub
                </a>
                <a href={`https://${dev.linkedin}`} className="social-link linkedin" target="_blank" rel="noopener noreferrer">
                  <span className="social-icon">💼</span>
                  LinkedIn
                </a>
              </div>
            </div>

            <div className="sidebar-card">
              <h3>🗣️ Langues</h3>
              <div className="languages">
                {dev.languages.map((lang, index) => (
                  <div key={index} className="language-item">
                    <div className="language-name">{lang}</div>
                    <div className="language-level">
                      <div className="level-dot active"></div>
                      <div className="level-dot active"></div>
                      <div className="level-dot active"></div>
                      <div className="level-dot"></div>
                      <div className="level-dot"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="profile-main">
            {/* Tab Content: Personal */}
            {activeTab === "personal" && (
              <div className="tab-content">
                <div className="info-card">
                  <h2>👤 À propos de moi</h2>
                  <div className="bio-content">
                    {dev.bio || "Passionné par le développement web et les nouvelles technologies. Toujours à la recherche de nouveaux défis et d'opportunités d'apprentissage."}
                  </div>
                  
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-number">150+</div>
                      <div className="stat-label">Projets</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">98%</div>
                      <div className="stat-label">Satisfaction</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">24/7</div>
                      <div className="stat-label">Disponibilité</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">3+</div>
                      <div className="stat-label">Années XP</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content: Skills */}
            {activeTab === "skills" && (
              <div className="tab-content">
                <div className="skills-card">
                  <h2>🚀 Mes compétences</h2>
                  <div className="skills-grid">
                    {dev.skills && dev.skills.split(",").map((skill, index) => (
                      <div key={index} className="skill-item">
                        <div className="skill-header">
                          <span className="skill-name">{skill.trim()}</span>
                          <span className="skill-level">Expert</span>
                        </div>
                        <div className="skill-bar">
                          <div 
                            className="skill-progress" 
                            style={{ width: `${80 + (index * 5)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="tech-stack">
                    <h3>🛠️ Stack technique</h3>
                    <div className="stack-grid">
                      <div className="tech-item frontend">
                        <div className="tech-icon">🎨</div>
                        <div className="tech-content">
                          <h4>Frontend</h4>
                          <p>React, Vue.js, TypeScript, Tailwind</p>
                        </div>
                      </div>
                      <div className="tech-item backend">
                        <div className="tech-icon">⚙️</div>
                        <div className="tech-content">
                          <h4>Backend</h4>
                          <p>Node.js, Express, Python, MongoDB</p>
                        </div>
                      </div>
                      <div className="tech-item tools">
                        <div className="tech-icon">🔧</div>
                        <div className="tech-content">
                          <h4>Outils</h4>
                          <p>Git, Docker, AWS, Figma</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content: Projects */}
            {activeTab === "projects" && (
              <div className="tab-content">
                <div className="projects-card">
                  <h2>💼 Mes projets</h2>
                  <div className="projects-grid">
                    {dev.projects.map((project, index) => (
                      <div key={index} className="project-card">
                        <div className="project-header">
                          <div className="project-icon">📁</div>
                          <div className="project-status completed"></div>
                        </div>
                        <h3 className="project-title">{project}</h3>
                        <p className="project-desc">
                          Application complète avec interface moderne et API robuste.
                        </p>
                        <div className="project-tech">
                          <span className="tech-tag">React</span>
                          <span className="tech-tag">Node.js</span>
                          <span className="tech-tag">MongoDB</span>
                        </div>
                        <div className="project-actions">
                          <button className="view-btn">👁️ Voir</button>
                          <button className="code-btn">💻 Code</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="profile-footer">
          <button className="download-cv-btn">
            <span className="btn-icon">📄</span>
            Télécharger CV
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="btn-icon">🚪</span>
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}