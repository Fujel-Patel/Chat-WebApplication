import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express(); // Create Express app
const server = http.createServer(app); // Create HTTP server with app

// Define allowed origins here and export it for use in index.js
export const allowedOrigins = [
  "https://chat-web-application-eqt3.vercel.app",
  "https://chat-web-application-eqt3-2hetdbyns-fujel-patels-projects.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`Socket.IO CORS blocked: Origin "${origin}" not allowed.`);
        callback(new Error("Not allowed by Socket.IO CORS"), false);
      }
    },
    credentials: true,
  },
});

// Map userId to socketId
const userSocketMap = {}; // { userId: socketId }

// Utility to get receiver socket id by user id
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Socket.IO Connection and User Management
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  const userId = socket.handshake.query.userId;

  if (userId) {
    if (userSocketMap[userId] && userSocketMap[userId] !== socket.id) {
      console.warn(`User ${userId} already has an active socket. Old socket ID: ${userSocketMap[userId]}. New socket ID: ${socket.id}`);
      // Optional: Disconnect the old socket if a user connects with a new socket
      // const oldSocket = io.sockets.sockets.get(userSocketMap[userId]);
      // if (oldSocket) {
      //   oldSocket.disconnect(true);
      //   console.log(`Disconnected old socket ${userSocketMap[userId]} for user ${userId}.`);
      // }
    }
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} mapped to socket ${socket.id}. Current online users: ${Object.keys(userSocketMap).length}`);
  } else {
    // Log a warning if a socket connects without a userId in the handshake query
    console.warn(`Socket ${socket.id} connected without a userId in handshake query.`);
  }

  // Emit online users to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);

    // Efficiently remove user from map
    let disconnectedUserId = null;
    for (const [uid, sid] of Object.entries(userSocketMap)) {
      if (sid === socket.id) {
        disconnectedUserId = uid;
        delete userSocketMap[uid];
        break;
      }
    }

    if (disconnectedUserId) {
      console.log(`User ${disconnectedUserId} (socket ${socket.id}) disconnected. Remaining online users: ${Object.keys(userSocketMap).length}`);
      // Emit updated online users to all clients
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    } else {
      console.log(`Disconnected socket ${socket.id} was not mapped to a user.`);
    }
  });

  // Handle potential errors on the socket itself
  socket.on("error", (err) => {
    console.error(`Socket error for ${socket.id}:`, err);
  });
});

export { io, app, server };