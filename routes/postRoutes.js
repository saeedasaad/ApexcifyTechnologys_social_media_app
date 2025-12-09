const express = require("express");
const router = express.Router();

const asyncHandler = require("express-async-handler");   
const Post = require("../models/Post");                 

const {
  createPost,
  toggleLike,
  getPost,
  deletePost,
  addComment,
  updatePost,
  getComments,
} = require("../controllers/postController");
const protect = require("../middleware/authMiddleware");

const multer = require("multer");
const fs = require("fs");
const path = require("path");

const POSTS_UPLOAD_DIR = path.join(__dirname, "..", "uploads", "posts");
if (!fs.existsSync(POSTS_UPLOAD_DIR)) {
  fs.mkdirSync(POSTS_UPLOAD_DIR, { recursive: true });
}

const postStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, POSTS_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, unique);
  },
});

const uploadPost = multer({ storage: postStorage });
const uploadFields = uploadPost.fields([
  { name: "image", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

// Routes

router.post("/", protect, uploadFields, createPost);


router.get("/", protect, asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .populate("author", "fullName avatar")  
    .sort({ createdAt: -1 });

  res.json(posts);
}));


router.get("/mine", protect, asyncHandler(async (req, res) => {
  const posts = await Post.find({ author: req.user._id })
    .populate("author", "fullName avatar")   
    .sort({ createdAt: -1 });

  res.json(posts);
}));

router.get("/:id", protect, getPost);
router.post("/:id/like", protect, toggleLike);
router.post("/:id/comments", protect, addComment);
router.get("/:id/comments", protect, getComments);
router.delete("/:id", protect, deletePost);
router.put("/:id", protect, updatePost);

module.exports = router;