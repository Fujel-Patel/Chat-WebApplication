import express from "express";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import cors from "cors"
import http from "http"; // Import the http module
import path from "path"

import { connectDB } from "./lib/db.js";
import { io, app } from "./lib/socket.js"; // Import io and the app
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(cookieParser());
app.use(cors({
  origin: "https://chat-web-application-eqt3.vercel.app", // your frontend port
  credentials: true,
}));

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

// if (process.env.NODE_ENV === "production") {
//   const frontendDistPath = path.join(__dirname, "../../frontend/dist");
//   const frontendIndexPath = path.join(__dirname, "../../frontend", "dist", "index.html");
//   console.log("Serving static files from:", frontendDistPath);
//   console.log("Serving index.html from:", frontendIndexPath);
//   app.use(express.static(frontendDistPath));

//   app.get("*", (req, res) => {
//     res.sendFile(frontendIndexPath);
//   });
// }

connectDB()
  .then(() => {
    console.log("Database Connected Successfully");
    const server = http.createServer(app);
    io.attach(server);
    server.listen(PORT, () => {
      console.log(`app run on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("database not connected:", error); // Log the error here
  });