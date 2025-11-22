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

// =========================
// Initialisation
// =========================
const app = express();
app.use(express.json());
app.use(cors());

// Connexion à MongoDB
connectDB();

// =========================
// Création auto de l’Admin (si absent)
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
// US1 : Login Admin
// =========================
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) return res.status(401).json({ error: "Admin non trouvé" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: "Mot de passe incorrect" });

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" },
      "votre_secret_key",
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
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

    // 🔹 Conversion skills en string
    // 🔹 Conversion skills en string sécurisée
   
    let skillsStr = "";
    if (Array.isArray(skills)) {
      skillsStr = skills.filter(s => typeof s === "string").join(", "); // filtrer non-string
     
      } else if (typeof skills === "string") {
  skillsStr = skills;
} else {
  skillsStr = ""; // par défaut vide si autre type
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
//  US3 : Login Développeur
// =========================
app.post("/api/dev/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const dev = await Developer.findOne({ email });

    if (!dev) return res.status(401).json({ message: "Développeur non trouvé" });

    const isMatch = await bcrypt.compare(password, dev.password);
    if (!isMatch)
      return res.status(401).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign(
      { id: dev._id, email: dev.email, role: "developer" },
      "votre_secret_key",
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      token,
      developer: {
        id: dev._id,
        name: dev.name,
        email: dev.email,
        skills: dev.skills,
        phone: dev.phone,      // ajout
        address: dev.address,  // ajout
        bio: dev.bio ,          // ajout
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors de la connexion" });
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
// US5 : Liste des Développeurs
// =========================
app.get("/api/admin/developers", async (req, res) => {
  try {
    const devs = await Developer.find();
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
    const { name, email, skills, phone, address } = req.body;

    const updatedDev = await Developer.findByIdAndUpdate(
      req.params.id,
      { name, email, skills, phone, address },
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
// 🚀 Lancer le serveur
// =========================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur DevOnDeck connecté à MongoDB sur http://localhost:${PORT}`);
});
