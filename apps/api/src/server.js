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
    // Join a personal room for targeted notifications
    socket.join(`user:${userId}`);
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

const prisma = require("./lib/prisma");
const bcrypt = require("bcryptjs");

const initializeAdminUser = async () => {
  try {
    const adminEmail = "admin@teamhub.com";
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!existingAdmin) {
      console.log("Seeding admin user...");
      const hashedPassword = await bcrypt.hash("admin123", 12);
      const user = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: "Alamin",
          role: "ADMIN"
        }
      });

      // Create a default workspace for the admin
      await prisma.workspace.create({
        data: {
          name: "Marketing Workspace",
          accentColor: "#8b5cf6", // Default purple for admin
          members: {
            create: {
              userId: user.id,
              role: "ADMIN"
            }
          }
        }
      });
      console.log("Admin user seeded successfully.");
    }
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
};

initializeAdminUser().then(() => {
  server.listen(port, () => {
    console.log(`API Server running on port ${port}`);
  });
});
