const mongoose = require("mongoose");

const OrganizationSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  industry: {
    type: String,
    default: ""
  },
  size: {
    type: String,
    enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
    default: "1-10"
  },
  website: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  }
}, {
  timestamps: true,
  collection: "organizations"
});

module.exports = mongoose.model("Organization", OrganizationSchema);