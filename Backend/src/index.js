import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import { fileURLToPath } from "url";
import { connectDB } from "./lib/db.js";
import { io, app, server } from "./lib/socket.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

// Setup __dirname with ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

const allowedOrigins = [
  "https://chat-web-application-eqt3.vercel.app",
  "https://chat-web-application-eqt3-2hetdbyns-fujel-patels-projects.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
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
    timestamp: new Date().toISOString(),
    api_version: "1.0",
  });
});

// Serve frontend (React build) from "frontend/dist"
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

// Start server after DB connection
connectDB()
  .then(() => {
    console.log("✅ Database Connected Successfully");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })

  .catch((error) => {
    console.error("❌ Database connection failed:", error);
  });
