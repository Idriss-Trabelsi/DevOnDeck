import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Composants
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home";
import JobOffers from "./components/JobOffers";
// Pages
import DevAuth from "./pages/DevAuth";
import OrgAuth from "./pages/OrgAuth";
import OrgDashboard from "./pages/OrgDashboard";
import AdminDashboard from "./pages/Dashboard";
import AdminProfile from "./pages/AdminProfile";
import AdminDevelopersList from "./pages/AdminDevelopersList";
import DevDashboard from "./pages/DevDashboard";
import DevProfile from "./pages/DevProfil";
import UnifiedAuth from "./pages/UnifiedAuth";

// Layout pour pages avec Navbar + Footer
function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "80vh" }}>{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Pages avec Navbar/Footer */}
        <Route 
          path="/" 
          element={
            <Layout>
              <Home />
            </Layout>
          } 
        />
        <Route 
          path="/unified-auth" 
          element={
            <Layout>
              <UnifiedAuth />
            </Layout>
          } 
        />
        <Route 
          path="/dev-auth" 
          element={
            <Layout>
              <DevAuth />
            </Layout>
          } 
        />
        <Route 
          path="/org-auth" 
          element={
            <Layout>
              <OrgAuth />
            </Layout>
          } 
        />

        {/* Pages sans Navbar/Footer - Admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/admin/developers" element={<AdminDevelopersList />} />

        {/* Pages sans Navbar/Footer - Developer */}
        <Route path="/developer/dashboard" element={<DevDashboard />} />
        <Route path="/developer/profile" element={<DevProfile />} />

        {/* Pages sans Navbar/Footer - Organization */}
        <Route path="/org/dashboard" element={<OrgDashboard />} />
        {/* Route commune - Offres d'emploi */}
        <Route path="/job-offers" element={<JobOffers />} />

        {/* Catch-all route pour les pages non trouvées */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}