import React, { useState } from 'react';
import '../styles/LoginAdmin.css';

function LoginAdmin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState(''); // ✅ pour afficher un message sur la page

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminData', JSON.stringify(data.admin));

        // ✅ Afficher un message temporaire
        setMessage('Connexion réussie ! Redirection en cours...');
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 1000);
      } else {
        setMessage(data.error || 'Erreur de connexion');
      }
      
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('Erreur de connexion au serveur');
    }
  };

  return (
    <div className="login-container">
      <h2>Connexion Admin DevOnDeck</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="admin@devondeck.com"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Mot de passe:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="admin123"
            required
          />
        </div>
        
        <button type="submit" className="login-btn">
          Se connecter
        </button>
      </form>

      {/* ✅ Affichage du message (succès ou erreur) */}
      {message && <p className="login-message">{message}</p>}
    </div>
  );
}

export default LoginAdmin;
