const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  jobOffer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "JobOffer",
    required: true
  },
  developer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Developer",
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true
  },
  
  // Champs enrichis
  coverLetter: {
    type: String,
    default: ""
  },
  expectedSalary: {
    type: Number,
    default: 0
  },
  availabilityDate: {
    type: String,
    default: ""
  },
  portfolioUrl: {
    type: String,
    default: ""
  },
  resumeUrl: {
    type: String,
    default: ""
  },
  
  // Statut
  status: {
    type: String,
    enum: ["pending", "reviewed", "accepted", "rejected"],
    default: "pending"
  },
  
  viewedByOrganization: {
    type: Boolean,
    default: false
  },
  
  applicationDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: "applications"
});

module.exports = mongoose.model("Application", ApplicationSchema);
