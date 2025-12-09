// routes/userRoutes.js
const express = require("express");
const router = express.Router();

const { getMe, updateProfile, uploadAvatar } = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");
const uploadAvatarMiddleware = require("../middleware/upload");

// Get current user
router.get("/me", protect, getMe);

// Update profile
router.put("/me", protect, updateProfile);

// Upload avatar
router.post("/me/avatar", protect, uploadAvatarMiddleware.single("avatar"), uploadAvatar);

module.exports = router;