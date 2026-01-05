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
const Application = require("./models/Application");


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

// ⚠️ IMPORTANT: Les routes spécifiques AVANT les routes avec paramètres dynamiques

// 1️⃣ Récupérer TOUTES les offres (pour la page commune) - DOIT ÊTRE EN PREMIER
app.get("/api/joboffers/all", async (req, res) => {
  try {
    console.log("📋 Récupération de toutes les offres...");
    
    const jobOffers = await JobOffer.find()
      .populate('organization', 'name email industry website description size')
      .sort({ createdAt: -1 });

    console.log(`✅ ${jobOffers.length} offre(s) trouvée(s)`);
    
    // Log pour debug - voir le contenu
    jobOffers.forEach(offer => {
      console.log(`  - ${offer.title} | Org: ${offer.organization?.name || 'NON DÉFINIE'} | Status: ${offer.status}`);
    });

    res.json({
      success: true,
      jobOffers
    });
  } catch (error) {
    console.error("❌ Erreur récupération toutes les offres:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// 2️⃣ Récupérer les offres d'une organisation spécifique
app.get("/api/joboffers/organization/:orgId", async (req, res) => {
  try {
    console.log("📋 Récupération des offres de l'organisation:", req.params.orgId);
    
    const jobOffers = await JobOffer.find({ organization: req.params.orgId })
      .populate('organization', 'name email industry')
      .sort({ createdAt: -1 });

    console.log(`✅ ${jobOffers.length} offre(s) trouvée(s) pour cette organisation`);

    res.json({
      success: true,
      jobOffers
    });
  } catch (error) {
    console.error("Erreur récupération offres:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3️⃣ Créer une offre de poste
app.post("/api/joboffers", async (req, res) => {
  try {
    const { title, description, requiredSkills, location, employmentType, salaryRange, organizationId } = req.body;

    console.log("📝 Création d'offre - OrganizationId reçu:", organizationId);

    if (!title || !description || !organizationId) {
      return res.status(400).json({ error: "Titre, description et organisation requis" });
    }

    // Vérifier que l'organisation existe
    const orgExists = await Organization.findById(organizationId);
    if (!orgExists) {
      console.error("❌ Organisation non trouvée:", organizationId);
      return res.status(404).json({ error: "Organisation non trouvée" });
    }

    console.log("✅ Organisation trouvée:", orgExists.name);

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

    console.log("✅ Offre créée avec succès:", jobOffer._id);

    // Populate l'organisation avant de renvoyer
    const populatedOffer = await JobOffer.findById(jobOffer._id)
      .populate('organization', 'name email industry');

    res.status(201).json({
      success: true,
      message: "Offre créée avec succès",
      jobOffer: populatedOffer
    });

  } catch (error) {
    console.error("❌ Erreur création offre:", error);
    res.status(500).json({ error: error.message });
  }
});

// 4️⃣ Modifier une offre
app.put("/api/joboffers/:id", async (req, res) => {
  try {
    const updatedOffer = await JobOffer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('organization', 'name email industry');

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

// 5️⃣ Supprimer une offre
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

// 6️⃣ Récupérer une offre spécifique par ID - DOIT ÊTRE EN DERNIER
app.get("/api/joboffers/:id", async (req, res) => {
  try {
    const jobOffer = await JobOffer.findById(req.params.id)
      .populate('organization', 'name email industry website description');

    if (!jobOffer) {
      return res.status(404).json({ 
        success: false,
        error: "Offre non trouvée" 
      });
    }

    res.json({
      success: true,
      jobOffer
    });
  } catch (error) {
    console.error("Erreur récupération offre:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});


// =========================
// 📬 APPLICATION ROUTES - COMPLÈTES ET CORRIGÉES
// =========================

// 🆕 POST : Candidature enrichie
app.post("/api/applications/enriched", async (req, res) => {
  try {
    const {
      jobOfferId,
      developerId,
      coverLetter,
      expectedSalary,
      availabilityDate,
      portfolioUrl,
      resumeUrl
    } = req.body;

    console.log("📥 Candidature enrichie reçue");

    if (!jobOfferId || !developerId) {
      return res.status(400).json({ 
        success: false, 
        error: "Données manquantes" 
      });
    }

    const jobOffer = await JobOffer.findById(jobOfferId);
    if (!jobOffer) {
      return res.status(404).json({ 
        success: false, 
        error: "Offre non trouvée" 
      });
    }

    const existingApp = await Application.findOne({
      jobOffer: jobOfferId,
      developer: developerId
    });

    if (existingApp) {
      return res.status(400).json({ 
        success: false, 
        error: "Déjà postulé" 
      });
    }

    const application = new Application({
      jobOffer: jobOfferId,
      developer: developerId,
      organization: jobOffer.organization,
      coverLetter: coverLetter || "",
      expectedSalary: expectedSalary || 0,
      availabilityDate: availabilityDate || "",
      portfolioUrl: portfolioUrl || "",
      resumeUrl: resumeUrl || "",
      status: "pending"
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: "Candidature envoyée",
      application: application
    });

  } catch (error) {
    console.error("❌ Erreur:", error);
    res.status(500).json({ 
      success: false, 
      error: "Erreur serveur" 
    });
  }
});

// 📋 GET : Candidatures d'un développeur
app.get("/api/applications/developer/:id", async (req, res) => {
  try {
    const applications = await Application.find({ 
      developer: req.params.id 
    })
      .populate("jobOffer", "title description location employmentType")
      .populate("organization", "name industry")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications: applications
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🏢 GET : Candidatures d'une organisation
app.get("/api/applications/organization/:id", async (req, res) => {
  try {
    const applications = await Application.find({ 
      organization: req.params.id 
    })
      .populate("developer", "name email skills bio phone address")
      .populate("jobOffer", "title location employmentType")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications: applications
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ error: error.message });
  }
});

// 👑 GET : TOUTES les candidatures (pour l'admin) - NOUVELLE ROUTE
app.get("/api/applications/all", async (req, res) => {
  try {
    console.log("🔄 Route /api/applications/all appelée");
    
    // Test simple d'abord
    const test = await Application.find().limit(1);
    console.log("✅ Test Application.find() réussi");
    
    const applications = await Application.find()
      .populate("developer", "name email skills")
      .populate("jobOffer", "title organization")
      .populate("organization", "name email")
      .sort({ createdAt: -1 });

    console.log(`✅ ${applications.length} candidature(s) trouvée(s)`);

    res.json({
      success: true,
      count: applications.length,
      applications: applications
    });
  } catch (error) {
    console.error("🔴 ERREUR dans /api/applications/all:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ 
      success: false,
      error: "Erreur serveur: " + error.message
    });
  }
});

// 👁️ GET : Une candidature complète
app.get("/api/applications/:id", async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate("developer", "name email skills bio phone address")
      .populate("jobOffer", "title description location employmentType")
      .populate("organization", "name email industry");

    if (!application) {
      return res.status(404).json({ error: "Non trouvée" });
    }

    res.json({
      success: true,
      application: application
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✏️ PUT : Mettre à jour le statut
app.put("/api/applications/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    
    const updateData = { status };
    
    if (status === "reviewed") {
      updateData.viewedByOrganization = true;
    }

    const updatedApp = await Application.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedApp) {
      return res.status(404).json({ error: "Non trouvée" });
    }

    res.json({
      success: true,
      message: "Statut mis à jour",
      application: updatedApp
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🔍 GET : Vérifier si déjà postulé
app.get("/api/applications/check/:developerId/:jobOfferId", async (req, res) => {
  try {
    const application = await Application.findOne({
      developer: req.params.developerId,
      jobOffer: req.params.jobOfferId
    });

    res.json({
      success: true,
      hasApplied: !!application
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ error: error.message });
  }
});
// =========================
// 🎯 US : MATCHING AVEC LES CANDIDATS QUI ONT POSTULÉ
// =========================

// Route pour calculer le matching uniquement avec les candidats
app.get("/api/joboffers/:jobId/matching/candidates", async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // 1. Récupérer le poste
    const jobOffer = await JobOffer.findById(jobId);
    if (!jobOffer) {
      return res.status(404).json({ success: false, error: "Offre non trouvée" });
    }

    // 2. Récupérer TOUTES les candidatures pour ce poste
    const applications = await Application.find({ 
      jobOffer: jobId 
    }).populate("developer", "name email skills bio phone address");

    console.log(`📋 ${applications.length} candidature(s) trouvée(s) pour l'offre ${jobId}`);

    // 3. Extraire les développeurs qui ont postulé
    const developers = applications.map(app => app.developer);

    // 4. Calculer le matching pour chaque développeur candidat
    const developersWithMatching = developers.map(developer => {
      const matching = calculateMatchingScore(developer, jobOffer);
      return {
        ...developer.toObject(),
        matchingScore: matching.score,
        matchedSkills: matching.matchedSkills,
        missingSkills: matching.missingSkills,
        applicationId: applications.find(app => app.developer._id.toString() === developer._id.toString())._id,
        applicationStatus: applications.find(app => app.developer._id.toString() === developer._id.toString()).status,
        applicationDate: applications.find(app => app.developer._id.toString() === developer._id.toString()).applicationDate
      };
    });

    // 5. Trier par score de matching (décroissant)
    developersWithMatching.sort((a, b) => b.matchingScore - a.matchingScore);

    res.json({
      success: true,
      jobOffer: {
        id: jobOffer._id,
        title: jobOffer.title,
        requiredSkills: jobOffer.requiredSkills || [],
        organization: jobOffer.organization
      },
      developers: developersWithMatching,
      totalCandidates: developersWithMatching.length,
      stats: {
        total: developersWithMatching.length,
        byScore: {
          high: developersWithMatching.filter(d => d.matchingScore >= 80).length,
          medium: developersWithMatching.filter(d => d.matchingScore >= 50 && d.matchingScore < 80).length,
          low: developersWithMatching.filter(d => d.matchingScore < 50).length
        }
      }
    });

  } catch (error) {
    console.error("❌ Erreur calcul matching candidats:", error);
    res.status(500).json({ 
      success: false, 
      error: "Erreur lors du calcul du matching" 
    });
  }
});

// Fonction de calcul du matching (identique)
function calculateMatchingScore(developer, jobOffer) {
  const developerSkills = developer.skills 
    ? developer.skills.toLowerCase().split(',').map(skill => skill.trim())
    : [];
  
  const jobSkills = jobOffer.requiredSkills || [];
  const jobSkillsLower = jobSkills.map(skill => skill.toLowerCase().trim());
  
  // Compétences correspondantes
  const matchedSkills = developerSkills.filter(skill => 
    jobSkillsLower.some(jobSkill => 
      skill.includes(jobSkill) || jobSkill.includes(skill)
    )
  );
  
  // Compétences manquantes
  const missingSkills = jobSkillsLower.filter(jobSkill => 
    !developerSkills.some(skill => 
      skill.includes(jobSkill) || jobSkill.includes(skill)
    )
  );
  
  // Calcul du score (pourcentage)
  const score = jobSkills.length > 0 
    ? Math.round((matchedSkills.length / jobSkills.length) * 100)
    : 0;
  
  return {
    score,
    matchedSkills,
    missingSkills,
    totalJobSkills: jobSkills.length,
    matchedCount: matchedSkills.length
  };
}

// Route pour filtrer les candidats par compétences
app.get("/api/joboffers/:jobId/candidates/filter", async (req, res) => {
  try {
    const { jobId } = req.params;
    const { skills, minScore, status } = req.query;
    
    // Récupérer le poste
    const jobOffer = await JobOffer.findById(jobId);
    if (!jobOffer) {
      return res.status(404).json({ success: false, error: "Offre non trouvée" });
    }

    // Récupérer les candidatures avec filtres
    let query = { jobOffer: jobId };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const applications = await Application.find(query)
      .populate("developer", "name email skills bio phone address");
    
    // Appliquer les filtres supplémentaires
    let filteredDevelopers = applications.map(app => {
      const matching = calculateMatchingScore(app.developer, jobOffer);
      return {
        ...app.developer.toObject(),
        matchingScore: matching.score,
        matchedSkills: matching.matchedSkills,
        missingSkills: matching.missingSkills,
        applicationId: app._id,
        applicationStatus: app.status,
        applicationDate: app.applicationDate
      };
    });
    
    // Filtre par compétences
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim().toLowerCase());
      filteredDevelopers = filteredDevelopers.filter(dev => 
        dev.skills && skillsArray.some(skill => 
          dev.skills.toLowerCase().includes(skill)
        )
      );
    }
    
    // Filtre par score minimum
    if (minScore) {
      filteredDevelopers = filteredDevelopers.filter(dev => 
        dev.matchingScore >= parseInt(minScore)
      );
    }
    
    res.json({
      success: true,
      developers: filteredDevelopers,
      count: filteredDevelopers.length
    });

  } catch (error) {
    console.error("Erreur filtre candidats:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Statistiques des candidatures par offre
app.get("/api/joboffers/:jobId/applications/stats", async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const applications = await Application.find({ jobOffer: jobId });
    
    const stats = {
      total: applications.length,
      byStatus: {
        pending: applications.filter(app => app.status === 'pending').length,
        reviewed: applications.filter(app => app.status === 'reviewed').length,
        accepted: applications.filter(app => app.status === 'accepted').length,
        rejected: applications.filter(app => app.status === 'rejected').length
      }
    };
    
    res.json({
      success: true,
      stats: stats
    });
    
  } catch (error) {
    console.error("Erreur statistiques:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
// =========================
// 🚀 Lancer le serveur
// =========================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur DevOnDeck connecté à MongoDB sur http://localhost:${PORT}`);
});