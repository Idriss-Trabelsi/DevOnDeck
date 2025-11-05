import React, { useState } from 'react';
import '../styles/LoginAdmin.css';

function LoginAdmin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

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
        alert('Connexion réussie!');
        window.location.href = '/admin/dashboard';
      } else {
        alert(data.error || 'Erreur de connexion');
      }
      
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion au serveur');
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
    </div>
  );
}

export default LoginAdmin;


