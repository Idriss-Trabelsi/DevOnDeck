const mongoose = require("mongoose");

// Définition du schéma du développeur
const DeveloperSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    password: { 
      type: String, 
      required: true 
    },
    skills: { 
      type: String, 
      default: "" 
    },
    bio: { 
      type: String, 
      default: "" 
    },
    phone: { 
      type: String, 
      required: true, 
      trim: true 
    },
    address: { 
      type: String, 
      required: true, 
      trim: true 
    }
  },
  { 
    timestamps: true,
    collection: "developers" 
  }
);

// Export du modèle
module.exports = mongoose.model("Developer", DeveloperSchema);
