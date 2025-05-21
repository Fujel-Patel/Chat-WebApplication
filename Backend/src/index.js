import express from "express";
import 'dotenv/config'; // Ensure dotenv is loaded
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http"; // Import the http module
import path from "path";

import { connectDB } from "./lib/db.js";
import { io, app } from "./lib/socket.js"; // Import io and the app (ensure app is truly created in socket.js and exported)
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve(); // This is used if you were serving static files, currently commented out

app.use(express.json({ limit: "10mb" })); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Parse URL-encoded request bodies

app.use(cookieParser()); // Parse cookies

// --- FIX START: CORS Configuration ---
// Define allowed origins for CORS. This is crucial for Vercel preview deployments.
const allowedOrigins = [
  "https://chat-web-application-eqt3.vercel.app", // Your primary Vercel deployment URL
  "https://chat-web-application-eqt3-2hetdbyns-fujel-patels-projects.vercel.app", // The specific preview URL from your error
  // Add other potential Vercel preview/branch URLs or development origins as needed
  // Example for local development:
  "http://localhost:5173", // Assuming your frontend runs on 5173 locally
  "http://localhost:3000", // Another common frontend development port
];

// If you have a VERCEL_URL environment variable set on Render that points to your Vercel frontend,
// you could try to dynamically add it.
// This is more advanced and depends on your Vercel/Render setup, but leaving it as a comment.
// const dynamicVercelUrl = process.env.VERCEL_FRONTEND_URL; // Or whatever you named it
// if (dynamicVercelUrl && !allowedOrigins.includes(dynamicVercelUrl)) {
//   allowedOrigins.push(dynamicVercelUrl);
// }

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., same-origin requests, file:/// for local dev)
    if (!origin) return callback(null, true);
    // Check if the requesting origin is in our allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from unknown origin: ${origin}`);
      callback(new Error(`Not allowed by CORS: ${origin}`), false);
    }
  },
  credentials: true, // Allow sending/receiving cookies/authorization headers
}));
// --- FIX END: CORS Configuration ---

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

// --- FIX START: Root Health Check Route ---
// Add a simple route for the root URL to confirm the API is running.
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Chat application backend is alive and well!',
    status: 'Online',
    timestamp: new Date().toISOString(),
    api_version: '1.0' // You can add your API version
  });
});
// --- FIX END: Root Health Check Route ---

// Your commented-out static file serving logic for frontend
// This is fine as your frontend is deployed separately on Vercel.
// if (process.env.NODE_ENV === "production") {
//   const frontendDistPath = path.join(__dirname, "../../frontend/dist");
//   const frontendIndexPath = path.join(__dirname, "../../frontend", "dist", "index.html");
//   console.log("Serving static files from:", frontendDistPath);
//   console.log("Serving index.html from:", frontendIndexPath);
//   app.use(express.static(frontendDistPath));

//   app.get("*", (req, res) => {
//     res.sendFile(frontendIndexPath);
//   });
// }

// Connect to the database and start the server
connectDB()
  .then(() => {
    console.log("Database Connected Successfully");
    // Create HTTP server using the Express app
    const server = http.createServer(app);
    // Attach Socket.IO to the same HTTP server
    io.attach(server);
    server.listen(PORT, () => {
      console.log(`App is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error); // More descriptive error message
  });

// import express from "express";
// import 'dotenv/config';
// import cookieParser from "cookie-parser";
// import cors from "cors"
// import http from "http"; // Import the http module
// import path from "path"

// import { connectDB } from "./lib/db.js";
// import { io, app } from "./lib/socket.js"; // Import io and the app
// import authRoutes from "./routes/auth.route.js";
// import messageRoutes from "./routes/message.route.js";

// const PORT = process.env.PORT || 5000;
// const __dirname = path.resolve();

// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// app.use(cookieParser());
// app.use(cors({
//   origin: "https://chat-web-application-eqt3-2hetdbyns-fujel-patels-projects.vercel.app/", // your frontend port
//   credentials: true,
// }));

// app.use("/api/auth", authRoutes);
// app.use("/api/message", messageRoutes);

// // if (process.env.NODE_ENV === "production") {
// //   const frontendDistPath = path.join(__dirname, "../../frontend/dist");
// //   const frontendIndexPath = path.join(__dirname, "../../frontend", "dist", "index.html");
// //   console.log("Serving static files from:", frontendDistPath);
// //   console.log("Serving index.html from:", frontendIndexPath);
// //   app.use(express.static(frontendDistPath));

// //   app.get("*", (req, res) => {
// //     res.sendFile(frontendIndexPath);
// //   });
// // }

// connectDB()
//   .then(() => {
//     console.log("Database Connected Successfully");
//     const server = http.createServer(app);
//     io.attach(server);
//     server.listen(PORT, () => {
//       console.log(`app run on port ${PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.error("database not connected:", error); // Log the error here
//   });