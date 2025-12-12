
import React, { useState } from "react";
import "../styles/EnhancedApplyModal.css";

export default function EnhancedApplyModal({ 
  offer, 
  developer, 
  onClose, 
  onSuccess 
}) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    coverLetter: "",
    expectedSalary: "",
    availabilityDate: "",
    portfolioUrl: "",
    resumeUrl: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Vérifiez que l'URL est correcte
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");
  
  try {
    const response = await fetch("http://localhost:5000/api/applications/enriched", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobOfferId: offer._id,
        developerId: developer.id,
        ...formData
      })
    });

    const data = await response.json();

    if (data.success) {
      setMessage("✅ Candidature envoyée avec succès !");
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } else {
      setMessage(`❌ ${data.error}`);
    }
  } catch (error) {
    setMessage("❌ Erreur de connexion au serveur");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Postuler : {offer.title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        {/* Barre de progression */}
        <div className="progress-bar">
          <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Motivation</div>
          </div>
          <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Infos</div>
          </div>
          <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Portfolio</div>
          </div>
        </div>
        
        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="step-content">
              <h3>📝 Lettre de motivation</h3>
              <p className="step-description">
                Présentez-vous à l'entreprise {offer.organization?.name}
              </p>
              
              <textarea
                className="cover-letter-input"
                name="coverLetter"
                placeholder={`Bonjour l'équipe de ${offer.organization?.name},\n\nJe suis intéressé par le poste de "${offer.title}" car...\n\nMes compétences : ${developer.skills}\n\nDisponible à partir de : ${new Date().toLocaleDateString()}\n\nCordialement,\n${developer.name}`}
                value={formData.coverLetter}
                onChange={handleInputChange}
                rows={8}
                required
              />
              
              <div className="button-group">
                <button 
                  type="button" 
                  className="next-btn"
                  onClick={() => setStep(2)}
                  disabled={!formData.coverLetter.trim()}
                >
                  Suivant →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <h3>💰 Informations complémentaires</h3>
              <p className="step-description">
                Aidez l'entreprise à mieux vous connaître
              </p>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Salaire attendu (€/an)</label>
                  <input
                    type="number"
                    name="expectedSalary"
                    placeholder="Ex: 45000"
                    value={formData.expectedSalary}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Disponible à partir du</label>
                  <input
                    type="date"
                    name="availabilityDate"
                    value={formData.availabilityDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="button-group">
                <button 
                  type="button" 
                  className="back-btn"
                  onClick={() => setStep(1)}
                >
                  ← Retour
                </button>
                <button 
                  type="button" 
                  className="next-btn"
                  onClick={() => setStep(3)}
                >
                  Suivant →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content">
              <h3>🔗 Portfolio et liens</h3>
              <p className="step-description">
                Partagez vos réalisations (optionnel)
              </p>
              
              <div className="form-group">
                <label>Portfolio / Site web</label>
                <input
                  type="url"
                  name="portfolioUrl"
                  placeholder="https://votre-portfolio.com"
                  value={formData.portfolioUrl}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>CV en ligne (LinkedIn, PDF, etc.)</label>
                <input
                  type="url"
                  name="resumeUrl"
                  placeholder="https://linkedin.com/in/votre-profil"
                  value={formData.resumeUrl}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="button-group">
                <button 
                  type="button" 
                  className="back-btn"
                  onClick={() => setStep(2)}
                >
                  ← Retour
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? "Envoi en cours..." : "📨 Envoyer ma candidature"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
