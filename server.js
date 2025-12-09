require("dotenv").config();
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");
const fs = require("fs");
const http = require("http"); 
const { Server } = require("socket.io");
const connectDB = require("./config/db");

// Route files
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const notificationRoutes = require("./routes/notificationRoutes"); 

const app = express();
const PORT = process.env.PORT || 5000;


// Connect to MongoDB

connectDB(process.env.MONGO_URI);


// Middleware

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Ensure Upload Directories Exist

const uploadDirs = [
  path.join(__dirname, "uploads", "profiles"),
  path.join(__dirname, "uploads", "posts"),
];
uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});


// Serve Uploads & Frontend

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "frontend")));


// API Routes

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes); 



app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || "Server Error",
  });
});



const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});


io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);


  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });


  socket.on("sendNotification", ({ receiverId, notification }) => {
    io.to(receiverId).emit("newNotification", notification);
  });

  socket.on("disconnect", () => {
    console.log(" Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});