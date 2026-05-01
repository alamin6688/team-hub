const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");

dotenv.config();

const port = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
});

global.io = io;

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-workspace", (workspaceId) => {
    socket.join(workspaceId);
    console.log(`User ${socket.id} joined workspace ${workspaceId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(port, () => {
  console.log(`API Server running on port ${port}`);
});
