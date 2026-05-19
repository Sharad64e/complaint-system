const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const {
  registerValidation,
  loginValidation,
} = require("../middleware/validation.middleware");

// POST /api/auth/register
router.post("/register", registerValidation, register);

// POST /api/auth/login
router.post("/login", loginValidation, login);

// GET /api/auth/me (protected)
router.get("/me", protect, getMe);

module.exports = router;
