const mongoose = require("mongoose");

const DeveloperSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  skills: { type: String, default: "" },
  bio: { type: String, default: "" }
});

module.exports = mongoose.model("Developer", DeveloperSchema);

