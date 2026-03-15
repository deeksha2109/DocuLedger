const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  docId: {
    type: String,
    required: true,
    unique: true
  },
  ownerEmail: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  issuer: {
    type: String,
    required: true
  },
  hashValue: {
    type: String,
    required: true
  },
  filePath: {
    type: String
  },
  qrCode: {
    type: String
  },
  txHash: {
    type: String
  },
  verified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Document", documentSchema);