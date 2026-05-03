const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");

const port = process.env.PORT || 8000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
});

global.io = io;

const onlineUsers = new Map(); // userId -> socketId

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join", (userId) => {
    socket.userId = userId;
    onlineUsers.set(userId, socket.id);
    io.emit("member-status-changed", { userId, isOnline: true });
    console.log(`User ${userId} is online`);
  });

  socket.on("join-workspace", (workspaceId) => {
    socket.join(workspaceId);
    console.log(`User ${socket.id} joined workspace ${workspaceId}`);
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit("member-status-changed", { userId: socket.userId, isOnline: false });
      console.log(`User ${socket.userId} is offline`);
    }
    console.log("User disconnected");
  });
});

global.isUserOnline = (userId) => onlineUsers.has(userId);

server.listen(port, () => {
  console.log(`API Server running on port ${port}`);
});
