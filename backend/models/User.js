const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["admin", "issuer", "verifier", "user"],
    default: "user"
  },
  course: String,
  enrollmentId: String,
  walletAddress: String,
  certificate: String
});

module.exports = mongoose.model("User", userSchema);