import { Server } from "socket.io";
import http from "http";
import express from "express";
import "dotenv/config";

const app = express();
const server = http.createServer(app);

// Parse CORS_ORIGINS from environment variable
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map(origin => origin.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

const io = new Server(server, {
  cors: {
    origin: (origin, callback)=>{
      if(!origin || allowedOrigins.includes(origin)){
        callback(null, true);
      }
      else{
        callback(new Error(`Not allowed by cors: ${origin}`))
      }
    },
    credentials: true,
    methods: ["GET", "POST"], // Allowed methods
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}
const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} mapped to socket ${socket.id}`);
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
