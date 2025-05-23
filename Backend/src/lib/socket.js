import express from "express";

import http from "http";

import { Server } from "socket.io";

const app = express(); // Create Express app

const server = http.createServer(app); // Create HTTP server with app

// Allowed origins for Socket.IO and CORS (keep this in sync with your backend CORS)

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

// Map userId to socketId

const userSocketMap = {};

// Utility to get receiver socket id by user id

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;

    console.log(`User ${userId} mapped to socket ${socket.id}`);
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id); // Remove user from map

    for (const [uid, sid] of Object.entries(userSocketMap)) {
      if (sid === socket.id) {
        delete userSocketMap[uid];

        break;
      }
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
