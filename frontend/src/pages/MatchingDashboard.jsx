
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/MatchingDashboard.css";

export default function MatchingDashboard() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [jobOffer, setJobOffer] = useState(null);
  const [candidates, setCandidates] = useState([]); // Renommé de developers à candidates
  const [loading, setLoading] = useState(true);
  const [orgData, setOrgData] = useState(null);
  const [stats, setStats] = useState(null);
  
  // Filtres
  const [skillFilter, setSkillFilter] = useState("");
  const [minScoreFilter, setMinScoreFilter] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("score");

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
    await fetchCandidates(); // Renommé
    await fetchStats();
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

  // NOUVELLE FONCTION : Récupérer les candidats (développeurs qui ont postulé)
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/joboffers/${jobId}/matching/candidates`);
      const data = await res.json();
      
      console.log("📊 Candidats reçus:", data);
      
      if (data.success) {
        setCandidates(data.developers || []);
      }
    } catch (error) {
      console.error("Erreur chargement candidats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/joboffers/${jobId}/applications/stats`);
      const data = await res.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Erreur statistiques:", error);
    }
  };

  // Filtrage des candidats
  const fetchFilteredCandidates = async () => {
    try {
      setLoading(true);
      let url = `http://localhost:5000/api/joboffers/${jobId}/candidates/filter?`;
      const params = new URLSearchParams();
      
      if (skillFilter) params.append('skills', skillFilter);
      if (minScoreFilter > 0) params.append('minScore', minScoreFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const res = await fetch(url + params.toString());
      const data = await res.json();
      
      if (data.success) {
        setCandidates(data.developers || []);
      }
    } catch (error) {
      console.error("Erreur filtre:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "high";
    if (score >= 50) return "medium";
    return "low";
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'status-pending';
      case 'reviewed': return 'status-reviewed';
      case 'accepted': return 'status-accepted';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return '⏳ En attente';
      case 'reviewed': return '👁️ Consulté';
      case 'accepted': return '✅ Accepté';
      case 'rejected': return '❌ Refusé';
      default: return status;
    }
  };

  const handleViewApplication = (applicationId) => {
    navigate(`/org/applications?applicationId=${applicationId}`);
  };

  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/applications/${applicationId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert(`Statut mis à jour: ${getStatusText(newStatus)}`);
        fetchCandidates(); // Recharger les données
      }
    } catch (error) {
      console.error("Erreur mise à jour statut:", error);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-spinner"></div>
        <p>Analyse des candidats...</p>
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
            <h1>🎯 Matching des candidats : {jobOffer?.title}</h1>
            <p>{candidates.length} candidat(s) ayant postulé</p>
            <div className="header-stats">
              {stats && (
                <div className="stats-chips">
                  <span className="stat-chip total">Total: {stats.total}</span>
                  <span className="stat-chip pending">En attente: {stats.byStatus?.pending || 0}</span>
                  <span className="stat-chip reviewed">Consultés: {stats.byStatus?.reviewed || 0}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Filtres */}
      <div className="filters-section">
        <div className="filters-card">
          <h3>🔍 Filtres avancés</h3>
          
          <div className="filter-group">
            <label>Compétences</label>
            <input
              type="text"
              placeholder="React, Node.js..."
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
          </div>

          <div className="filter-group">
            <label>Statut de candidature</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="reviewed">Consultés</option>
              <option value="accepted">Acceptés</option>
              <option value="rejected">Refusés</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Trier par</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="score">Score de matching</option>
              <option value="date">Date de candidature</option>
              <option value="name">Nom</option>
            </select>
          </div>

          <div className="filter-actions">
            <button className="apply-filters-btn" onClick={fetchFilteredCandidates}>
              Appliquer les filtres
            </button>
            <button className="reset-filters-btn" onClick={() => {
              setSkillFilter("");
              setMinScoreFilter(0);
              setStatusFilter("all");
              fetchCandidates();
            }}>
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="stats-card">
          <h3>📊 Analyse des candidats</h3>
          
          <div className="matching-stats">
            <div className="stat-row">
              <span className="stat-label">Candidats total:</span>
              <span className="stat-value">{candidates.length}</span>
            </div>
            
            <div className="stat-row">
              <span className="stat-label">Score moyen:</span>
              <span className="stat-value">
                {candidates.length > 0 
                  ? Math.round(candidates.reduce((acc, c) => acc + (c.matchingScore || 0), 0) / candidates.length)
                  : 0}%
              </span>
            </div>
            
            <div className="stat-row">
              <span className="stat-label">Top matches (≥80%):</span>
              <span className="stat-value high">
                {candidates.filter(c => (c.matchingScore || 0) >= 80).length}
              </span>
            </div>
            
            <div className="stat-row">
              <span className="stat-label">Matches moyens (50-80%):</span>
              <span className="stat-value medium">
                {candidates.filter(c => (c.matchingScore || 0) >= 50 && (c.matchingScore || 0) < 80).length}
              </span>
            </div>
          </div>
          
          {jobOffer?.requiredSkills && jobOffer.requiredSkills.length > 0 && (
            <div className="required-skills">
              <h4>Compétences recherchées:</h4>
              <div className="skills-list">
                {jobOffer.requiredSkills.map((skill, idx) => (
                  <span key={idx} className="required-skill">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Liste des candidats */}
      <div className="candidates-list">
        <div className="list-header">
          <h2>🧑‍💻 Candidats correspondants ({candidates.length})</h2>
          <div className="sort-info">
            Trié par: {sortBy === 'score' ? 'Score de matching' : 
                      sortBy === 'date' ? 'Date de candidature' : 'Nom'}
          </div>
        </div>

        {candidates.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>Aucun candidat trouvé</h3>
            <p>Aucun développeur n'a postulé à cette offre ou les filtres sont trop restrictifs</p>
            <button 
              className="btn-view-applications"
              onClick={() => navigate(`/org/applications`)}
            >
              Voir toutes les candidatures
            </button>
          </div>
        ) : (
          <div className="candidates-grid">
            {candidates.map((candidate) => (
              <div key={candidate._id} className="candidate-card">
                <div className="card-header">
                  <div className="candidate-avatar">
                    {candidate.name?.charAt(0).toUpperCase() || "C"}
                  </div>
                  <div className="candidate-info">
                    <h3>{candidate.name}</h3>
                    <p className="candidate-email">{candidate.email}</p>
                    <div className="candidate-meta">
                      <span className="application-date">
                        Postulé le: {new Date(candidate.applicationDate).toLocaleDateString('fr-FR')}
                      </span>
                      <span className={`application-status ${getStatusColor(candidate.applicationStatus)}`}>
                        {getStatusText(candidate.applicationStatus)}
                      </span>
                    </div>
                  </div>
                  <div className={`score-badge ${getScoreColor(candidate.matchingScore || 0)}`}>
                    <span className="score-number">{candidate.matchingScore || 0}%</span>
                    <span className="score-label">Match</span>
                  </div>
                </div>

                <div className="card-content">
                  {/* Compétences et matching */}
                  <div className="matching-details">
                    <div className="matching-breakdown">
                      <div className="breakdown-item">
                        <span className="breakdown-label">Compétences correspondantes:</span>
                        <span className="breakdown-value">
                          {candidate.matchedSkills?.length || 0} / {jobOffer?.requiredSkills?.length || 0}
                        </span>
                      </div>
                      
                      {candidate.matchedSkills && candidate.matchedSkills.length > 0 && (
                        <div className="matched-skills">
                          <span className="skills-label">✓ Correspondances:</span>
                          <div className="skills-tags">
                            {candidate.matchedSkills.slice(0, 5).map((skill, idx) => (
                              <span key={idx} className="skill-tag matched">{skill}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {candidate.missingSkills && candidate.missingSkills.length > 0 && (
                        <div className="missing-skills">
                          <span className="skills-label">✗ Manquantes:</span>
                          <div className="skills-tags">
                            {candidate.missingSkills.slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="skill-tag missing">{skill}</span>
                            ))}
                            {candidate.missingSkills.length > 3 && (
                              <span className="skill-tag more">+{candidate.missingSkills.length - 3}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Bio */}
                    {candidate.bio && (
                      <div className="candidate-bio">
                        <h4>📝 À propos</h4>
                        <p>{candidate.bio.substring(0, 150)}...</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="card-actions">
                    <button 
                      className="action-btn view-application"
                      onClick={() => handleViewApplication(candidate.applicationId)}
                    >
                      📋 Voir candidature
                    </button>
                    
                    <div className="status-actions">
                      <select 
                        className="status-select"
                        value={candidate.applicationStatus}
                        onChange={(e) => handleUpdateStatus(candidate.applicationId, e.target.value)}
                      >
                        <option value="pending">⏳ En attente</option>
                        <option value="reviewed">👁️ Marquer comme vu</option>
                        <option value="accepted">✅ Accepter</option>
                        <option value="rejected">❌ Refuser</option>
                      </select>
                    </div>
                    
                    <button 
                      className="action-btn contact"
                      onClick={() => window.location.href = `mailto:${candidate.email}`}
                    >
                      📧 Contacter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top suggestions */}
      {candidates.filter(c => (c.matchingScore || 0) >= 80).length > 0 && (
        <div className="top-suggestions">
          <h2>💎 Top candidats (≥80% de match)</h2>
          <div className="suggestions-grid">
            {candidates
              .filter(c => (c.matchingScore || 0) >= 80)
              .slice(0, 3)
              .map((candidate) => (
                <div key={candidate._id} className="suggestion-card">
                  <div className="suggestion-header">
                    <div className="suggestion-avatar">
                      {candidate.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4>{candidate.name}</h4>
                      <div className="suggestion-score">
                        <span className="score-highlight">{candidate.matchingScore}%</span> de match
                      </div>
                      <div className="suggestion-status">
                        Statut: {getStatusText(candidate.applicationStatus)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="suggestion-skills">
                    {candidate.matchedSkills?.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="suggestion-skill">✓ {skill}</span>
                    ))}
                  </div>
                  
                  <div className="suggestion-actions">
                    <button 
                      className="suggestion-btn primary"
                      onClick={() => handleUpdateStatus(candidate.applicationId, 'accepted')}
                    >
                      ✅ Accepter
                    </button>
                    <button 
                      className="suggestion-btn secondary"
                      onClick={() => handleViewApplication(candidate.applicationId)}
                    >
                      Voir détails
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}