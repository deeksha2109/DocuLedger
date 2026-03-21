const express = require("express");
const router = express.Router();
const multer = require("multer");

const ctrl = require("../controllers/auth.controller");
const { protect, allowRoles } = require("../middleware/auth");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/register", ctrl.register);
router.post("/login", ctrl.login);
router.get("/users", protect, allowRoles("admin"), ctrl.getUsers);
router.post("/add-student", protect, allowRoles("admin"), upload.single("certificateFile"), ctrl.addStudent);
router.delete("/students/:id", protect, allowRoles("admin"), ctrl.deleteStudent);
router.post("/reset-password-direct", ctrl.resetPasswordDirect);
router.put("/change-password", protect, ctrl.changePassword);

module.exports = router;