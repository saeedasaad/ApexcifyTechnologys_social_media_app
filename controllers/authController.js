const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Helper to generate JWT
function generateToken(userId) {
  const jwtSecret = process.env.JWT_SECRET || "dev_secret_key";
  if (!process.env.JWT_SECRET) {
    console.warn("Warning: JWT_SECRET is not set. Using default development secret.");
  }
  return jwt.sign({ id: userId }, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, bio } = req.body; 
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "Please provide all required fields" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: "Email already in use" });
  }

  const avatar = req.file ? `/uploads/profiles/${req.file.filename}` : undefined;
  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName,
    email,
    password: hashed,
    avatar,
    bio,
  });

  const token = generateToken(user._id);
  res.status(201).json({
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar || "/uploads/profiles/default.png",
      bio: user.bio,
    },
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = generateToken(user._id);
  res.json({
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar || "/uploads/profiles/default.png",
      bio: user.bio,
    },
  });
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  const { _id, fullName, email, avatar, bio } = req.user;
  res.json({
    user: {
      id: _id,
      fullName,
      email,
      avatar: avatar || "/uploads/profiles/default.png",
      bio,
    },
  });
});

module.exports = { register, login, me };