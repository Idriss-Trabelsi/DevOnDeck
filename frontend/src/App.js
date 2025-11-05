import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages principales
import Home from "./components/Home";                  // Page d'accueil
import LoginAdmin from "./components/LoginAdmin";      // Login Admin
import DevAuth from "./components/DevAuth";            // Inscription + Login Dev (fusionné)

// Dashboards
import AdminDashboard from "./components/Dashboard";   // Dashboard Admin
import DevDashboard from "./components/DevDashboard";  // Dashboard Dev

// Admin pages
import AdminProfile from "./components/AdminProfile";                  // Gestion profil admin
import AdminDevelopersList from "./components/AdminDevelopersList";   // Liste développeurs

// Dev profile
import DevProfile from "./components/DevProfil";                      // Page profil dev

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Page d'accueil */}
        <Route path="/" element={<Home />} />

        {/* Authentification */}
        <Route path="/login-admin" element={<LoginAdmin />} />
        <Route path="/dev-auth" element={<DevAuth />} />  {/* Inscription + Login Dev */}

        {/* Dashboard Admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/admin/developers" element={<AdminDevelopersList />} />

        {/* Dashboard Développeur */}
        <Route path="/developer/dashboard" element={<DevDashboard />} />
        <Route path="/developer/profile" element={<DevProfile />} />

        {/* Catch-all */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}


