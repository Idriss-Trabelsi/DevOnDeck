// frontend/src/components/MatchingDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/MatchingDashboard.css";

export default function MatchingDashboard() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [jobOffer, setJobOffer] = useState(null);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orgData, setOrgData] = useState(null);
  
  // Filtres
  const [skillFilter, setSkillFilter] = useState("");
  const [minScoreFilter, setMinScoreFilter] = useState(0);
  const [sortBy, setSortBy] = useState("score");
  const [showSuggestions, setShowSuggestions] = useState(true);

  useEffect(() => {
    checkAuthAndFetch();
  }, [jobId]);

  const checkAuthAndFetch = async () => {
    const data = JSON.parse(localStorage.getItem("organizationData"));
    const token = localStorage.getItem("organizationToken");
    
    if (!data || !token) {
      window.location.href = "/unified-auth";
      return;
    }

    setOrgData(data);
    await fetchJobOffer();
    await fetchMatchingDevelopers();
  };

  const fetchJobOffer = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/joboffers/${jobId}`);
      const data = await res.json();
      
      if (data.success) {
        setJobOffer(data.jobOffer);
      }
    } catch (error) {
      console.error("Erreur chargement offre:", error);
    }
  };

  const fetchMatchingDevelopers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/joboffers/${jobId}/matching`);
      const data = await res.json();
      
      if (data.success) {
        setDevelopers(data.developers || []);
      }
    } catch (error) {
      console.error("Erreur matching:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredDevelopers = async () => {
    try {
      let url = `http://localhost:5000/api/developers/filter?`;
      const params = new URLSearchParams();
      
      if (skillFilter) params.append('skills', skillFilter);
      if (minScoreFilter > 0) params.append('minScore', minScoreFilter);
      
      const res = await fetch(url + params.toString());
      const data = await res.json();
      
      if (data.success) {
        // Recalculer le matching pour les développeurs filtrés
        const filteredWithMatching = data.developers.map(developer => {
          if (jobOffer) {
            const matching = calculateMatching(developer, jobOffer);
            return { ...developer, ...matching };
          }
          return developer;
        });
        
        // Trier selon le critère
        const sorted = filteredWithMatching.sort((a, b) => {
          if (sortBy === "score") return b.matchingScore - a.matchingScore;
          if (sortBy === "name") return a.name.localeCompare(b.name);
          return 0;
        });
        
        setDevelopers(sorted);
      }
    } catch (error) {
      console.error("Erreur filtre:", error);
    }
  };

  const calculateMatching = (developer, job) => {
    const devSkills = developer.skills ? developer.skills.toLowerCase().split(',').map(s => s.trim()) : [];
    const jobSkills = job.requiredSkills || [];
    const jobSkillsLower = jobSkills.map(s => s.toLowerCase().trim());
    
    const matched = devSkills.filter(skill => 
      jobSkillsLower.some(jobSkill => skill.includes(jobSkill) || jobSkill.includes(skill))
    );
    
    const score = jobSkills.length > 0 
      ? Math.round((matched.length / jobSkills.length) * 100)
      : 0;
    
    return {
      matchingScore: score,
      matchedSkills: matched,
      missingSkills: jobSkillsLower.filter(js => !matched.some(s => s.includes(js)))
    };
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "high";
    if (score >= 50) return "medium";
    return "low";
  };

  const handleViewDeveloper = (developerId) => {
    navigate(`/developer/profile/${developerId}`);
  };

  const handleContactDeveloper = (developer) => {
    // Logique de contact
    console.log("Contacter:", developer.email);
    alert(`Contacter ${developer.name} à ${developer.email}`);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-spinner"></div>
        <p>Calcul des correspondances...</p>
      </div>
    );
  }

  return (
    <div className="matching-container">
      {/* Header */}
      <header className="matching-header">
        <div className="header-content">
          <button className="back-btn" onClick={() => navigate("/org/dashboard")}>
            ← Retour au dashboard
          </button>
          <div className="header-title">
            <h1>🎯 Matching pour : {jobOffer?.title}</h1>
            <p>Compétences recherchées: {jobOffer?.requiredSkills?.join(', ') || "Aucune"}</p>
          </div>
        </div>
      </header>

      {/* Filtres */}
      <div className="filters-section">
        <div className="filters-card">
          <h3>🔍 Filtres avancés</h3>
          
          <div className="filter-group">
            <label>Compétences spécifiques</label>
            <input
              type="text"
              placeholder="React, Node.js, MongoDB..."
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Score minimum ({minScoreFilter}%)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(parseInt(e.target.value))}
              className="score-slider"
            />
            <div className="score-labels">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="filter-group">
            <label>Trier par</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="score">Score de matching</option>
              <option value="name">Nom</option>
            </select>
          </div>

          <div className="filter-actions">
            <button className="apply-filters-btn" onClick={fetchFilteredDevelopers}>
              Appliquer les filtres
            </button>
            <button className="reset-filters-btn" onClick={() => {
              setSkillFilter("");
              setMinScoreFilter(0);
              fetchMatchingDevelopers();
            }}>
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="stats-card">
          <h3>📊 Statistiques de matching</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{developers.length}</div>
              <div className="stat-label">Développeurs analysés</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                {developers.length > 0 
                  ? Math.round(developers.reduce((acc, dev) => acc + (dev.matchingScore || 0), 0) / developers.length)
                  : 0}%
              </div>
              <div className="stat-label">Score moyen</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                {developers.filter(d => (d.matchingScore || 0) >= 80).length}
              </div>
              <div className="stat-label">Top matches</div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des développeurs */}
      <div className="developers-list">
        <div className="list-header">
          <h2>🧑‍💻 Développeurs correspondants ({developers.length})</h2>
          <div className="view-toggle">
            <button 
              className={`view-btn ${showSuggestions ? 'active' : ''}`}
              onClick={() => setShowSuggestions(true)}
            >
              Suggestions intelligentes
            </button>
            <button 
              className={`view-btn ${!showSuggestions ? 'active' : ''}`}
              onClick={() => setShowSuggestions(false)}
            >
              Liste complète
            </button>
          </div>
        </div>

        {developers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>Aucun développeur trouvé</h3>
            <p>Ajustez vos filtres ou modifiez les compétences recherchées</p>
          </div>
        ) : (
          <div className="developers-grid">
            {developers.map((developer) => (
              <div key={developer._id} className="developer-card">
                <div className="card-header">
                  <div className="dev-avatar">
                    {developer.name?.charAt(0).toUpperCase() || "D"}
                  </div>
                  <div className="dev-info">
                    <h3>{developer.name}</h3>
                    <p className="dev-email">{developer.email}</p>
                  </div>
                  <div className={`score-badge ${getScoreColor(developer.matchingScore || 0)}`}>
                    <span className="score-number">{developer.matchingScore || 0}%</span>
                    <span className="score-label">Match</span>
                  </div>
                </div>

                <div className="card-content">
                  {/* Compétences */}
                  <div className="skills-section">
                    <h4>🛠️ Compétences</h4>
                    <div className="skills-tags">
                      {developer.skills?.split(',').slice(0, 5).map((skill, idx) => {
                        const isMatched = developer.matchedSkills?.includes(skill.trim().toLowerCase());
                        return (
                          <span key={idx} className={`skill-tag ${isMatched ? 'matched' : ''}`}>
                            {skill.trim()}
                            {isMatched && <span className="match-indicator">✓</span>}
                          </span>
                        );
                      })}
                      {developer.skills?.split(',').length > 5 && (
                        <span className="skill-tag more">
                          +{developer.skills.split(',').length - 5}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Analyse de matching */}
                  <div className="matching-analysis">
                    <div className="analysis-row">
                      <span className="analysis-label">Correspondances:</span>
                      <span className="analysis-value">
                        {developer.matchedSkills?.length || 0} / {jobOffer?.requiredSkills?.length || 0}
                      </span>
                    </div>
                    
                    {developer.missingSkills && developer.missingSkills.length > 0 && (
                      <div className="analysis-row">
                        <span className="analysis-label warning">Compétences manquantes:</span>
                        <div className="missing-skills">
                          {developer.missingSkills.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="missing-tag">{skill}</span>
                          ))}
                          {developer.missingSkills.length > 3 && (
                            <span className="missing-tag more">+{developer.missingSkills.length - 3}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {developer.bio && (
                      <div className="analysis-row">
                        <span className="analysis-label">Bio:</span>
                        <p className="bio-preview">{developer.bio.substring(0, 100)}...</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="card-actions">
                    <button 
                      className="action-btn view-profile"
                      onClick={() => handleViewDeveloper(developer._id)}
                    >
                      👁️ Voir profil
                    </button>
                    <button 
                      className="action-btn contact"
                      onClick={() => handleContactDeveloper(developer)}
                    >
                      📧 Contacter
                    </button>
                    <button className="action-btn save">
                      💾 Sauvegarder
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggestions intelligentes */}
      {showSuggestions && developers.filter(d => (d.matchingScore || 0) >= 70).length > 0 && (
        <div className="suggestions-section">
          <h2>💎 Top suggestions</h2>
          <div className="suggestions-grid">
            {developers
              .filter(d => (d.matchingScore || 0) >= 70)
              .slice(0, 3)
              .map((developer) => (
                <div key={developer._id} className="suggestion-card">
                  <div className="suggestion-header">
                    <div className="suggestion-avatar">
                      {developer.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4>{developer.name}</h4>
                      <div className="suggestion-score">
                        <span className="score-highlight">{developer.matchingScore}%</span> de match
                      </div>
                    </div>
                  </div>
                  <div className="suggestion-skills">
                    {developer.matchedSkills?.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="suggestion-skill">✓ {skill}</span>
                    ))}
                  </div>
                  <button 
                    className="suggestion-btn"
                    onClick={() => handleViewDeveloper(developer._id)}
                  >
                    Explorer ce profil
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}