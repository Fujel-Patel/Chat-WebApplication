import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

// ✅ Define allowed origins (keep in sync with frontend)
const allowedOrigins = [
  "https://chat-web-application-eqt3.vercel.app",
  "https://chat-web-application-eqt3-2hetdbyns-fujel-patels-projects.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// ✅ Map to keep track of userId to socketId
const userSocketMap = {};

// 🔧 Utility to retrieve a socket ID by userId
export const getReceiverSocketId = (userId) => userSocketMap[userId];

io.on("connection", (socket) => {
  console.log("✅ A user connected:", socket.id);

  const userId = socket.handshake.query.userId;

  // Associate userId with socketId
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`🧍 User ${userId} is now online as socket ${socket.id}`);
  }

  // Notify all clients of online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("❌ A user disconnected:", socket.id);

    // Clean up mapping
    for (const [uid, sid] of Object.entries(userSocketMap)) {
      if (sid === socket.id) {
        delete userSocketMap[uid];
        console.log(`🗑️ Removed user ${uid} from online map`);
        break;
      }
    }

    // Broadcast updated online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };