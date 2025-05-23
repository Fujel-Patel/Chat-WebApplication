import express from "express";
import "dotenv/config"; // Ensure dotenv is loaded globally at the very top
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./lib/db.js";
// Import app, server, and io from socket.js. We will also export allowedOrigins from here.
import { io, app, server, allowedOrigins } from "./lib/socket.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

// Setup __dirname with ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Middleware
app.use(express.json({ limit: "10mb" })); // Increased limit for potential image uploads
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// CORS Configuration for Express
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like same-origin requests, mobile apps, or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`Express CORS blocked: Origin "${origin}" not allowed.`);
        callback(new Error(`Not allowed by CORS: ${origin}`), false);
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Set-Cookie"],
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Chat application backend is alive and well!",
    status: "Online",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    api_version: "1.0",
  });
});

// Serve frontend (React build) from "frontend/dist"
// This should come AFTER your API routes to ensure API calls are not caught by this.
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// For any other GET request, serve the React app's index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

// Start server after DB connection
connectDB()
  .then(() => {
    console.log("✅ Database Connected Successfully");
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${NODE_ENV}`);
    });
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error);
    // Exit the process if DB connection fails - critical for app functionality
    process.exit(1);
  });