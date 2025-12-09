const Notification = require("../models/Notification");

// CREATE NOTIFICATION

exports.createNotification = async (req, res) => {
  try {
    const { receiver, type, post, comment, message } = req.body;
    const sender = req.user._id;

    const notification = new Notification({
      receiver,
      sender,
      type,
      post,
      comment,
      message,
    });

    await notification.save();



    res.status(201).json(notification);
  } catch (err) {
    console.error("Error creating notification:", err);
    res.status(500).json({ message: "Server error creating notification" });
  }
};

// GET ALL NOTIFICATIONS FOR USER

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ receiver: req.user._id })
      .populate("sender", "fullName avatar")
      .populate("post", "text")
      .populate("comment", "text")
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Server error fetching notifications" });
  }
};

// MARK NOTIFICATION AS READ

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ message: "Server error marking notification" });
  }
};

// DELETE NOTIFICATION

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await notification.deleteOne(); 

    res.status(200).json({ message: "Notification deleted" });
  } catch (err) {
    console.error("Error deleting notification:", err);
    res.status(500).json({ message: "Server error deleting notification" });
  }
};