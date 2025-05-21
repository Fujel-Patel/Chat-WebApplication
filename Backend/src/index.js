import express from "express";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import { connectDB } from "./lib/db.js";
import { io, app, server } from "./lib/socket.js"; // Import the server here
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Allowed origins - must match socket.js allowed origins for consistency
const allowedOrigins = [
  "https://chat-web-application-eqt3.vercel.app",
  "https://chat-web-application-eqt3-2hetdbyns-fujel-patels-projects.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from unknown origin: ${origin}`);
      callback(new Error(`Not allowed by CORS: ${origin}`), false);
    }
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Set-Cookie"],
}));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

// Root route for health check
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Chat application backend is alive and well!',
    status: 'Online',
    timestamp: new Date().toISOString(),
    api_version: '1.0'
  });
});

// Connect DB and start server
connectDB()
  .then(() => {
    console.log("Database Connected Successfully");
    server.listen(PORT, () => {
      console.log(`App is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });