const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Notification = require("../models/Notification"); 
const fs = require("fs");
const path = require("path");

// GET /api/users/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar || "/uploads/profiles/default.png",
    },
  });
});

// PUT /api/users/me
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { fullName, email, bio } = req.body;

  if (email && email !== user.email) {
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400);
      throw new Error("Email already in use");
    }
    user.email = email;
  }

  if (fullName) user.fullName = fullName;
  if (typeof bio === "string") user.bio = bio;

  await user.save();

  res.json({
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar || "/uploads/profiles/default.png",
    },
  });
});

// POST /api/users/me/avatar
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Delete old avatar if not default
  if (user.avatar && !user.avatar.includes("/uploads/profiles/default.png")) {
    const oldAvatarPath = path.join(process.cwd(), user.avatar.replace(/^\//, ""));
    try {
      if (fs.existsSync(oldAvatarPath)) fs.unlinkSync(oldAvatarPath);
    } catch (err) {
      console.error("Failed to delete old avatar:", err);
    }
  }

  // Save new avatar path
  user.avatar = `/uploads/profiles/${req.file.filename}`;
  await user.save();

  res.json({ avatar: user.avatar });
});

// POST /api/users/:id/follow
const followUser = asyncHandler(async (req, res) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user._id;

  if (targetUserId === currentUserId.toString()) {
    res.status(400);
    throw new Error("You cannot follow yourself");
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    res.status(404);
    throw new Error("User not found");
  }

  // Add follower if not already following
  if (!targetUser.followers.includes(currentUserId)) {
    targetUser.followers.push(currentUserId);
    await targetUser.save();

    // Create notification for the followed user
    const notification = new Notification({
      receiver: targetUser._id,
      sender: currentUserId,
      type: "follow",
    });
    await notification.save();

    // Emit via Socket.io if available
    if (req.io) {
      req.io.to(targetUser._id.toString()).emit("newNotification", notification);
    }
  }

  res.json({ message: `You are now following ${targetUser.fullName}` });
});


module.exports = { getMe, updateProfile, uploadAvatar, followUser };