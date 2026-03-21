require('dotenv').config();
const mongoose = require('mongoose');

// Define minimal schema to fetch docs without full Document.js dependencies
const DocSchema = new mongoose.Schema({
  docId: String,
  title: String,
  hashValue: String
}, { strict: false });
const Doc = mongoose.model('Document', DocSchema);

async function checkDocs() {
  try {
    const mongoUri = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/doculedger';
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");
    
    // Get all docs
    const docs = await Doc.find({}).sort({createdAt: -1});
    console.log(`Found ${docs.length} documents.`);
    if (docs.length > 0) {
      console.log("Most recent documents:");
      docs.slice(0, 3).forEach(d => {
        console.log(`- ID: ${d.docId}, Title: ${d.title}, Hash: ${d.hashValue}`);
      });
    }
    
    mongoose.disconnect();
  } catch(e) {
    console.error("DB Error:", e);
  }
}

checkDocs();
