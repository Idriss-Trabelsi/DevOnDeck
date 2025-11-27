// =========================
//  Importations
// =========================
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const connectDB = require("./config/db");
const Admin = require("./models/Admin");
const Developer = require("./models/Developer");
const Organization = require("./models/Organization");
const JobOffer = require("./models/JobOffer");

// =========================
// Initialisation
// =========================
const app = express();
app.use(express.json());
app.use(cors());

// Connexion à MongoDB
connectDB();

// =========================
// Création auto de l'Admin (si absent)
// =========================
const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ email: "admin@devondeck.com" });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await Admin.create({
        name: "Admin DevOnDeck",
        email: "admin@devondeck.com",
        password: hashedPassword,
      });
      console.log("✅ Admin par défaut créé : admin@devondeck.com / admin123");
    } else {
      console.log("ℹ️ Admin déjà présent dans la base de données.");
    }
  } catch (error) {
    console.error("❌ Erreur création admin :", error.message);
  }
};
createDefaultAdmin();

// =========================
// US : Login Unifié (Admin, Dev, Organization) - CORRIGÉ
// =========================
app.post("/api/auth/unified-login", async (req, res) => {
  try {
    console.log("🔐 Tentative de connexion unifiée reçue:", {
      email: req.body.email,
      passwordLength: req.body.password ? req.body.password.length : 0
    });
    
    const { email, password } = req.body;

    // Validation des champs requis
    if (!email || !password) {
      console.log("❌ Champs manquants:", { 
        email: !!email, 
        password: !!password
      });
      return res.status(400).json({ 
        success: false,
        error: "Email et mot de passe requis" 
      });
    }

    let user = null;
    let role = "";
    let Model = null;

    // RECHERCHE AUTOMATIQUE dans les 3 collections
    console.log("🔍 Recherche automatique de l'utilisateur...");
    
    // 1. Chercher dans Admin
    user = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (user) {
      role = "admin";
      Model = Admin;
      console.log("✅ Utilisateur trouvé dans: Admin");
    }
    
    // 2. Si pas admin, chercher dans Developer
    if (!user) {
      user = await Developer.findOne({ email: email.toLowerCase().trim() });
      if (user) {
        role = "developer";
        Model = Developer;
        console.log("✅ Utilisateur trouvé dans: Developer");
      }
    }
    
    // 3. Si pas developer, chercher dans Organization
    if (!user) {
      user = await Organization.findOne({ email: email.toLowerCase().trim() });
      if (user) {
        role = "organization";
        Model = Organization;
        console.log("✅ Utilisateur trouvé dans: Organization");
      }
    }

    // Si aucun utilisateur trouvé
    if (!user) {
      console.log(`❌ Aucun utilisateur trouvé avec email: ${email}`);
      return res.status(401).json({ 
        success: false,
        error: "Email ou mot de passe incorrect" 
      });
    }

    console.log(`✅ ${role} trouvé: ${user.name || user.email}`);

    // Vérification du mot de passe
    console.log("🔑 Vérification du mot de passe...");
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log("❌ Mot de passe incorrect");
      return res.status(401).json({ 
        success: false,
        error: "Email ou mot de passe incorrect" 
      });
    }

    console.log("✅ Mot de passe correct");

    // Génération du token JWT
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: role 
      },
      "votre_secret_key",
      { expiresIn: "24h" }
    );

    // Construction de la réponse
    const response = {
      success: true,
      token,
      role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    };

    // Ajouter des champs spécifiques selon le rôle
    if (role === "developer") {
      response.user.skills = user.skills || "";
      response.user.phone = user.phone || "";
      response.user.address = user.address || "";
      response.user.bio = user.bio || "";
    } else if (role === "organization") {
      response.user.industry = user.industry || "";
      response.user.size = user.size || "";
      response.user.website = user.website || "";
    }

    console.log(`🎉 Connexion réussie pour ${role}: ${user.email}`);
    console.log("📤 Envoi réponse:", response);
    
    res.json(response);

  } catch (error) {
    console.error("💥 ERREUR SERVEUR dans unified-login:", error);
    res.status(500).json({ 
      success: false,
      error: "Erreur serveur lors de la connexion",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// =========================
//  US2 : signup dev 
// =========================
app.post("/api/dev/signup", async (req, res) => {
  try {
    const { name, email, password, skills, bio, phone, address } = req.body;

    // 🔹 Vérification champs obligatoires
    if (!name || !email || !password || !phone || !address) {
      return res.status(400).json({ error: "Tous les champs requis doivent être remplis" });
    }

    // 🔹 Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ error: "Email invalide" });

    // 🔹 Validation mot de passe
    if (password.length < 6) return res.status(400).json({ error: "Mot de passe trop court" });

    // 🔹 Validation téléphone
    if (phone.replace(/\D/g, "").length < 8) return res.status(400).json({ error: "Téléphone invalide" });

    // 🔹 Vérifier si email existe
    if (await Developer.findOne({ email })) return res.status(400).json({ error: "Email déjà utilisé" });

    // 🔹 Vérifier si mot de passe déjà utilisé
    const allDevs = await Developer.find({}, { password: 1 });
    for (let dev of allDevs) {
      if (dev.password && await bcrypt.compare(password, dev.password)) {
        return res.status(400).json({ error: "Mot de passe déjà utilisé" });
      }
    }

    // 🔹 Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 Conversion skills en string sécurisée
    let skillsStr = "";
    if (Array.isArray(skills)) {
      skillsStr = skills.filter(s => typeof s === "string").join(", ");
    } else if (typeof skills === "string") {
      skillsStr = skills;
    } else {
      skillsStr = "";
    }

    // 🔹 Création du développeur
    const newDev = await Developer.create({
      name,
      email,
      password: hashedPassword,
      skills: skillsStr, 
      bio: bio || "",
      phone,
      address
    });

    // 🔹 Génération du token JWT
    const token = jwt.sign(
      { id: newDev._id, email: newDev.email, role: "developer" },
      "votre_secret_key",
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: "Inscription réussie",
      token,
      developer: {
        id: newDev._id,
        name: newDev.name,
        email: newDev.email,
        skills: newDev.skills,
        bio: newDev.bio,
        phone: newDev.phone,
        address: newDev.address
      }
    });

  } catch (error) {
    console.error("Erreur signup :", error);
    res.status(500).json({ error: error.message });
  }
});
// =========================
//  US3 : Mise à jour profil développeur
// =========================
app.put("/api/dev/profile/:id", async (req, res) => {
  try {
    const { name, email, skills, bio, phone, address } = req.body;
    
    console.log("📥 Données reçues pour mise à jour:", req.body);

    // Validation des champs requis
    if (!name || !email || !phone || !address) {
      return res.status(400).json({ 
        success: false, 
        error: "Tous les champs requis doivent être remplis" 
      });
    }

    // Vérifier si l'email existe déjà pour un autre développeur
    const existingDev = await Developer.findOne({ 
      email: email.toLowerCase().trim(), 
      _id: { $ne: req.params.id } 
    });
    
    if (existingDev) {
      return res.status(400).json({ 
        success: false, 
        error: "Email déjà utilisé par un autre développeur" 
      });
    }

    // Conversion skills en string sécurisée
    let skillsStr = "";
    if (Array.isArray(skills)) {
      skillsStr = skills.filter(s => typeof s === "string").join(", ");
    } else if (typeof skills === "string") {
      skillsStr = skills;
    } else {
      skillsStr = "";
    }

    const updatedDev = await Developer.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        email: email.toLowerCase().trim(), 
        skills: skillsStr,
        bio: bio || "",
        phone, 
        address 
      },
      { new: true, runValidators: true }
    );

    if (!updatedDev) {
      return res.status(404).json({ 
        success: false, 
        error: "Développeur non trouvé" 
      });
    }

    console.log("✅ Profil développeur mis à jour:", updatedDev.email);

    res.json({
      success: true,
      message: "Profil mis à jour avec succès",
      developer: {
        id: updatedDev._id,
        name: updatedDev.name,
        email: updatedDev.email,
        skills: updatedDev.skills,
        bio: updatedDev.bio,
        phone: updatedDev.phone,
        address: updatedDev.address
      }
    });

  } catch (error) {
    console.error("❌ Erreur mise à jour profil:", error);
    res.status(500).json({ 
      success: false, 
      error: "Erreur serveur lors de la mise à jour du profil" 
    });
  }
});

// =========================
//  US4 : Profil Admin
// =========================
app.get("/api/admin/profile/:id", async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin non trouvé" });
    res.json({ success: true, data: admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.put("/api/admin/profile/:id", async (req, res) => {
  try {
    const { name, email } = req.body;
    const updated = await Admin.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ success: false, message: "Admin non trouvé" });

    res.json({ success: true, message: "Profil mis à jour ✅", data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// =========================
// US5 : Liste des Développeurs AVEC BIO
// =========================
app.get("/api/admin/developers", async (req, res) => {
  try {
    const devs = await Developer.find().select('-password');
    res.json({ success: true, data: devs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// =========================
// 🧩 US6 : Modifier un développeur
// =========================
app.put("/api/admin/developers/:id", async (req, res) => {
  try {
    const { name, email, skills, bio, phone, address } = req.body;

    const updatedDev = await Developer.findByIdAndUpdate(
      req.params.id,
      { name, email, skills, bio, phone, address },
      { new: true }
    );

    if (!updatedDev)
      return res.status(404).json({ success: false, message: "Développeur non trouvé" });

    res.json({
      success: true,
      message: "Développeur mis à jour ✅",
      data: updatedDev,
    });
  } catch (err) {
    console.error("Erreur lors de la mise à jour :", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// =========================
// 🧩 US7 : Supprimer un développeur
// =========================
app.delete("/api/admin/developers/:id", async (req, res) => {
  try {
    const deletedDev = await Developer.findByIdAndDelete(req.params.id);

    if (!deletedDev)
      return res.status(404).json({ success: false, message: "Développeur non trouvé" });

    res.json({ success: true, message: "Développeur supprimé avec succès 🗑️" });
  } catch (err) {
    console.error("Erreur lors de la suppression :", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// =========================
// 🏢 Inscription ORGANIZATION 
// =========================
app.post("/api/org/signup", async (req, res) => {
  try {
    const { name, email, password, industry, size, website, description } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nom, email et mot de passe requis" });
    }

    // Vérifier si l'email existe déjà
    const existingOrg = await Organization.findOne({ email });
    if (existingOrg) {
      return res.status(400).json({ error: "Email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newOrg = await Organization.create({
      name,
      email,
      password: hashedPassword,
      industry,
      size,
      website,
      description
    });

    const token = jwt.sign(
      { id: newOrg._id, email: newOrg.email, role: "organization" },
      "votre_secret_key",
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: "Organisation créée avec succès",
      token,
      organization: {
        id: newOrg._id,
        name: newOrg.name,
        email: newOrg.email,
        industry: newOrg.industry,
        size: newOrg.size
      }
    });

  } catch (error) {
    console.error("Erreur signup organization:", error);
    res.status(500).json({ error: error.message });
  }
});

// =========================
// 💼 JOB OFFERS MANAGEMENT
// =========================

// Créer une offre de poste
app.post("/api/joboffers", async (req, res) => {
  try {
    const { title, description, requiredSkills, location, employmentType, salaryRange, organizationId } = req.body;

    if (!title || !description || !organizationId) {
      return res.status(400).json({ error: "Titre, description et organisation requis" });
    }

    const jobOffer = await JobOffer.create({
      title,
      description,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [requiredSkills],
      location: location || "Remote",
      employmentType: employmentType || "Full-time",
      salaryRange: salaryRange || { min: 0, max: 0 },
      organization: organizationId,
      status: "active"
    });

    res.status(201).json({
      success: true,
      message: "Offre créée avec succès",
      jobOffer
    });

  } catch (error) {
    console.error("Erreur création offre:", error);
    res.status(500).json({ error: error.message });
  }
});

// Récupérer les offres d'une organisation
app.get("/api/joboffers/organization/:orgId", async (req, res) => {
  try {
    const jobOffers = await JobOffer.find({ organization: req.params.orgId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      jobOffers
    });
  } catch (error) {
    console.error("Erreur récupération offres:", error);
    res.status(500).json({ error: error.message });
  }
});

// Modifier une offre
app.put("/api/joboffers/:id", async (req, res) => {
  try {
    const updatedOffer = await JobOffer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedOffer) {
      return res.status(404).json({ error: "Offre non trouvée" });
    }

    res.json({
      success: true,
      message: "Offre mise à jour",
      jobOffer: updatedOffer
    });
  } catch (error) {
    console.error("Erreur mise à jour offre:", error);
    res.status(500).json({ error: error.message });
  }
});

// Supprimer une offre
app.delete("/api/joboffers/:id", async (req, res) => {
  try {
    const deletedOffer = await JobOffer.findByIdAndDelete(req.params.id);

    if (!deletedOffer) {
      return res.status(404).json({ error: "Offre non trouvée" });
    }

    res.json({
      success: true,
      message: "Offre supprimée avec succès"
    });
  } catch (error) {
    console.error("Erreur suppression offre:", error);
    res.status(500).json({ error: error.message });
  }
});

// =========================
// 🚀 Lancer le serveur
// =========================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur DevOnDeck connecté à MongoDB sur http://localhost:${PORT}`);
});