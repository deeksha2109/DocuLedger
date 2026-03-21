const Document = require("../models/Document");
const contract = require("../blockchain/docLedger");
const supabase = require("../config/supabase");
console.log("Supabase keys:", Object.keys(supabase || {}));
console.log("Supabase.storage:", supabase?.storage);
const { generateQR } = require("../utils/qr");
console.log(generateQR);
const { v4: uuidv4 } = require("uuid");

exports.uploadDocument = async (req, res) => {

  try {

    const { title, issuer, ownerEmail, hashValue } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "File missing" });
    }

    const docId = uuidv4();

    const filePath = `certificates/${docId}-${file.originalname}`;

    // 👉 THIS IS WHERE supabase.storage.from() GOES
    const { error } = await supabase.storage
      .from("certificates")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype
      });

    if (error) {
      return res.status(500).json(error);
    }

    // blockchain transaction
    const tx = await contract.addDocument(
      docId,
      ownerEmail,
      title,
      issuer,
      hashValue
    );

    await tx.wait();

    const qr = await generateQR(docId);

    const doc = await Document.create({
      docId,
      ownerEmail,
      title,
      issuer,
      hashValue,
      filePath,
      qrCode: qr,
      txHash: tx.hash,
      verified: false
    });

    res.json(doc);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

};

exports.verifyDocument = async (req, res) => {

  const { docId } = req.body;

  const tx = await contract.verifyDocument(docId);

  await tx.wait();

  await Document.updateOne(
    { docId },
    { verified: true }
  );

  res.json({ success: true });
};

exports.unverifyDocument = async (req, res) => {
  try {
    const { docId } = req.body;
    if (!docId) return res.status(400).json({ message: "docId is required." });

    const doc = await Document.findOne({ docId });
    if (!doc) return res.status(404).json({ message: "Document not found." });

    // Blockchain is immutable — only update the DB status
    await Document.updateOne({ docId }, { verified: false });

    res.json({ success: true, message: "Certificate marked as unverified in system records." });
  } catch (error) {
    res.status(500).json({ message: "Failed to unverify document." });
  }
};

exports.getMyDocuments = async (req, res) => {

  const { email } = req.params;

  const docs = await Document.find({ ownerEmail: email });

  res.json(docs);
};

exports.getDocumentById = async (req, res) => {

  const data = await contract.getDocument(req.params.docId);

  res.json({
    docId: data[0],
    owner: data[1],
    title: data[2],
    issuer: data[3],
    hashValue: data[4],
    timestamp: data[5].toString(),
    verified: data[6]
  });
};

exports.getAllDocuments = async (req, res) => {
  try {
    const docs = await Document.find().sort({ createdAt: -1 });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch documents" });
  }
};

exports.getDocumentByHash = async (req, res) => {
  try {
    const doc = await Document.findOne({ hashValue: req.params.hashValue });
    if (!doc) {
      return res.status(404).json({ message: "Document not found or invalid hash signature." });
    }
    
    res.json({
        docId: doc.docId,
        owner: doc.ownerEmail,
        title: doc.title,
        issuer: doc.issuer,
        hashValue: doc.hashValue,
        timestamp: doc.createdAt,
        verified: doc.verified || true,
        txHash: doc.txHash
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during hash verification." });
  }
};

exports.getDownloadUrl = async (req, res) => {
  try {
    // Try searching by docId (UUID) first, then fall back to _id
    let doc = await Document.findOne({ docId: req.params.docId });
    if (!doc) {
      // Fallback: search by MongoDB _id
      doc = await Document.findById(req.params.docId).catch(() => null);
    }
    if (!doc || !doc.filePath) {
      return res.status(404).json({ message: "File not found for this document." });
    }

    // The bucket is private — always use a signed URL (1 hour expiry)
    const { data: signedData, error } = await supabase.storage
      .from("certificates")
      .createSignedUrl(doc.filePath, 3600);

    if (error) {
      console.error("Supabase signed URL error:", error);
      return res.status(500).json({ message: "Could not generate download link.", detail: error.message });
    }

    res.json({ url: signedData.signedUrl, filename: doc.title || "certificate" });
  } catch (error) {
    res.status(500).json({ message: "Server error generating download URL." });
  }
};