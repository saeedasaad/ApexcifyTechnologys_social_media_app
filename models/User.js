const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, },
    password: { type: String, required: true,},
    avatar: { type: String, default: "/uploads/profiles/default.png",},
    bio: { type: String, default: "", trim: true,},
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User",},],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User",},],
  },
  { timestamps: true, }
);

module.exports = mongoose.model("User", userSchema);