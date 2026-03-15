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