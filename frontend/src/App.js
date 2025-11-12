import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Composants
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home";

// Pages
import LoginAdmin from "./pages/LoginAdmin";
import DevAuth from "./pages/DevAuth";
import AdminDashboard from "./pages/Dashboard";
import AdminProfile from "./pages/AdminProfile";
import AdminDevelopersList from "./pages/AdminDevelopersList";
import DevDashboard from "./pages/DevDashboard";
import DevProfile from "./pages/DevProfil";

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
          path="/login-admin" 
          element={
            <Layout>
              <LoginAdmin />
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

        {/* Pages sans Navbar/Footer */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/admin/developers" element={<AdminDevelopersList />} />
        <Route path="/developer/dashboard" element={<DevDashboard />} />
        <Route path="/developer/profile" element={<DevProfile />} />

        {/* Catch-all */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

