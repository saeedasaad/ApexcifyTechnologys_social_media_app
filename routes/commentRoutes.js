// routes/commentRoutes.js
const express = require("express");
const router = express.Router({ mergeParams: true });

const { addComment } = require("../controllers/commentController");
const protect = require("../middleware/authMiddleware"); 

// Add a comment
router.post("/", protect, addComment);

module.exports = router;