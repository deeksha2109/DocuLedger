const User = require("../models/User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {

  const { name, email, password, role } = req.body;

  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hash,
    role
  });

  res.json(user);
};

exports.login = async (req, res) => {

  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return res.status(400).json({ message: "Invalid password" });
  }

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ user, token });
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

exports.addStudent = async (req, res) => {
  try {
    const { name, email, course, enrollmentId, walletAddress, certificate } = req.body;
    const file = req.file;

    // Check if user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Student with this email already exists." });
    }

    // Default password for students added by admin
    const defaultPassword = "Student@123";
    const hash = await bcrypt.hash(defaultPassword, 10);

    const user = await User.create({
      name,
      email,
      password: hash,
      role: 'user',
      course,
      enrollmentId,
      walletAddress,
      certificate
    });

    // If a certificate file was also uploaded, mint it on the blockchain
    if (file) {
      const supabase    = require("../config/supabase");
      const contract    = require("../blockchain/docLedger");
      const { generateQR } = require("../utils/qr");
      const { v4: uuidv4 } = require("uuid");
      const Document    = require("../models/Document");
      const crypto      = require("crypto");

      const docId      = uuidv4();
      const filePath   = `certificates/${docId}-${file.originalname}`;

      // Compute real SHA-256 hash of the file buffer
      const hashValue  = "0x" + crypto.createHash("sha256").update(file.buffer).digest("hex");

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("certificates")
        .upload(filePath, file.buffer, { contentType: file.mimetype });

      if (uploadError) {
        // Student created but file upload failed — report partial success
        return res.status(207).json({
          user,
          warning: "Student registered but certificate upload failed: " + uploadError.message
        });
      }

      // Mint on blockchain
      const adminUser = JSON.parse(req.body.adminInfo || "{}");
      const issuer = adminUser.name || "DocuLedger Admin";
      const title  = certificate || file.originalname;

      const tx = await contract.addDocument(docId, email, title, issuer, hashValue);
      await tx.wait();

      const qr = await generateQR(docId);

      await Document.create({
        docId,
        ownerEmail: email,
        title,
        issuer,
        hashValue,
        filePath,
        qrCode: qr,
        txHash: tx.hash,
        verified: false
      });
    }

    res.json(user);
  } catch (error) {
    console.error("addStudent error:", error);
    res.status(500).json({ message: "Failed to add student. Please try again." });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // req.user is set by the protect middleware
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to change password. Please try again." });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Student not found." });
    }

    // Prevent accidental deletion of admin accounts
    if (user.role === 'admin') {
      return res.status(403).json({ message: "Cannot delete an admin account." });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: "Student deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete student." });
  }
};

exports.resetPasswordDirect = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Direct password reset error:", error);
    res.status(500).json({ message: "Failed to reset password." });
  }
};