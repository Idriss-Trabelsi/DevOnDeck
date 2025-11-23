const mongoose = require("mongoose");

const JobOfferSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    default: "Remote"
  },
  employmentType: {
    type: String,
    enum: ["Full-time", "Part-time", "Contract", "Internship"],
    default: "Full-time"
  },
  salaryRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true
  },
  status: {
    type: String,
    enum: ["active", "closed", "draft"],
    default: "active"
  }
}, {
  timestamps: true,
  collection: "joboffers"
});

module.exports = mongoose.model("JobOffer", JobOfferSchema);