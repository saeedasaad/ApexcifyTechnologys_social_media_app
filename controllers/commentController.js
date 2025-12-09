const asyncHandler = require("express-async-handler");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const Notification = require("../models/Notification"); 

exports.addComment = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const { text } = req.body;

  if (!text) {
    res.status(400);
    throw new Error("Comment text required");
  }

  const post = await Post.findById(postId).populate("author", "fullName avatar");
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  // Create the comment
  const comment = await Comment.create({
    post: postId,
    author: req.user._id,
    text,
  });

  // Update post comment count
  post.commentsCount = (post.commentsCount || 0) + 1;
  await post.save();

  // Populate comment with author info
  const populatedComment = await Comment.findById(comment._id).populate("author", "fullName avatar");

  // Create notification for post author (if not commenting own post)
  if (post.author._id.toString() !== req.user._id.toString()) {
    const notification = new Notification({
      receiver: post.author._id,
      sender: req.user._id,
      type: "comment",
      post: post._id,
      comment: comment._id,
    });
    await notification.save();

    // Emit via Socket.io if available
    if (req.io) {
      req.io.to(post.author._id.toString()).emit("newNotification", notification);
    }
  }

  res.status(201).json(populatedComment);
});