const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/document.controller");
console.log(ctrl);
const upload = require("../middleware/upload");
const { protect, allowRoles } = require("../middleware/auth");

router.post(
  "/upload",
  protect,
  allowRoles("admin"),
  upload.single("file"),
  ctrl.uploadDocument
);

router.post(
  "/verify",
  protect,
  allowRoles("admin", "verifier"),
  ctrl.verifyDocument
);

router.post(
  "/unverify",
  protect,
  allowRoles("admin"),
  ctrl.unverifyDocument
);

// Public Route for Verification
router.get("/hash/:hashValue", ctrl.getDocumentByHash);

router.get("/my/:email", protect, ctrl.getMyDocuments);

router.get("/all", protect, allowRoles("admin"), ctrl.getAllDocuments);

router.get("/download/:docId", protect, ctrl.getDownloadUrl);

router.get("/:docId", ctrl.getDocumentById);

module.exports = router;