const express = require("express");
const router = express.Router();

const { register, login, me } = require("../controllers/authController"); // destructure functions
const protect = require("../middleware/authMiddleware");                  // import function directly
const uploadAvatarMiddleware = require("../middleware/upload");

router.post("/register", uploadAvatarMiddleware.single("avatar"), register);
router.post("/login", login);
router.get("/me", protect, me);

module.exports = router;