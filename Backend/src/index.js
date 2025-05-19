import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import cors from "cors"

import path from "path"

import { connectDB } from "./lib/db.js"; 

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();
// const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(cookieParser()); 
app.use(cors({
  origin: "chat-web-application-eight-orpin.vercel.app", // your frontend port
  credentials: true,
}));

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

connectDB()
  .then(() => {
    console.log("Database Connected Successfully");
    server.listen(PORT, () => {
      console.log(`app run on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("database not connected");
  });
