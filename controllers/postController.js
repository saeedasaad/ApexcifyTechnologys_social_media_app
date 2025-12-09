const asyncHandler = require("express-async-handler");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const path = require("path");
const fs = require("fs");


function safeUnlink(filePath) {
  if (!filePath) return;
  const full = path.join(process.cwd(), filePath.replace(/^\//, ""));
  if (fs.existsSync(full)) fs.unlinkSync(full);
}

// Create post
exports.createPost = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const { text } = req.body;

  let image = "";
  if (req.files?.image?.length > 0) {
    image = "/uploads/posts/" + req.files.image[0].filename;
  }

  let file = "";
  if (req.files?.file?.length > 0) {
    file = "/uploads/posts/" + req.files.file[0].filename;
  }

  const post = await Post.create({
    author: req.user._id,
    text: text || "",
    image,
    file,
    likes: [],
    bookmarks: [],
    commentsCount: 0,
  });

  const populated = await Post.findById(post._id).populate("author", "fullName avatar");
  res.status(201).json(populated);
});

// Get feed
exports.getFeed = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate("author", "fullName avatar");
  res.json(posts);
});

// Get single post
exports.getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("author", "fullName avatar");

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const comments = await Comment.find({ post: post._id })
    .sort({ createdAt: 1 })
    .populate("author", "fullName avatar");

  post.comments = comments;
  res.json(post);
});

// Like/unlike post
exports.toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate("author", "fullName avatar");
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const userId = req.user._id;
  const idx = post.likes.findIndex((id) => id.toString() === userId.toString());
  let liked = false;

  if (idx === -1) {
    post.likes.push(userId);
    liked = true;

    if (post.author._id.toString() !== userId.toString()) {
      const notification = new Notification({
        receiver: post.author._id,
        sender: userId,
        type: "like",
        post: post._id,
      });
      await notification.save();

      if (req.io) {
        req.io.to(post.author._id.toString()).emit("newNotification", notification);
      }
    }
  } else {
    post.likes.splice(idx, 1);
  }

  await post.save();
  res.json({ likesCount: post.likes.length, liked });
});

//  Add comment to post
exports.addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const post = await Post.findById(req.params.id).populate("author", "fullName avatar");

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const comment = await Comment.create({
    post: post._id,
    author: req.user._id,
    text,
  });

  post.commentsCount += 1;
  await post.save();

  const populatedComment = await Comment.findById(comment._id).populate("author", "fullName avatar");

  if (post.author._id.toString() !== req.user._id.toString()) {
    const notification = new Notification({
      receiver: post.author._id,
      sender: req.user._id,
      type: "comment",
      post: post._id,
      comment: comment._id,
    });
    await notification.save();

    if (req.io) {
      req.io.to(post.author._id.toString()).emit("newNotification", notification);
    }
  }

  res.status(201).json(populatedComment);
});

//  Get all comments for a post
exports.getComments = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const comments = await Comment.find({ post: req.params.id })
    .populate("author", "fullName avatar")
    .sort({ createdAt: -1 });

  res.json(comments);
});

//  Delete post
exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }
  if (post.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  safeUnlink(post.image);
  safeUnlink(post.file);

  await Comment.deleteMany({ post: post._id });
  await Post.deleteOne({ _id: post._id });

  res.json({ message: "Post removed" });
});

//  Update post
exports.updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }
  if (post.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  post.text = req.body.text || post.text;
  await post.save();

  const populated = await Post.findById(post._id).populate("author", "fullName avatar");
  res.json(populated);
});