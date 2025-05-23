import jwt from "jsonwebtoken";
import User from "../models/user.model.js"; // Ensure path is correct, e.g., user.js or user.model.js

const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided or invalid format." });
    }

    const token = authHeader.split(" ")[1];

    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({ message: "Unauthorized: Token is missing or invalid." });
    }

    // It's best practice to load dotenv at the app's entry point (e.g., server.js)
    // so process.env.JWT_SECRET is guaranteed to be available globally.
    if (!process.env.JWT_SECRET) {
      console.error("Server configuration error: JWT_SECRET is not defined.");
      return res.status(500).json({ message: "Server configuration error: Authentication secret missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: "Unauthorized: Invalid token payload." });
    }

    // Select only necessary user fields to attach to the request
    const user = await User.findById(decoded.userId).select("_id fullName email profilePic");

    if (!user) {
      // User might have been deleted after the token was issued
      return res.status(404).json({ message: "Unauthorized: User not found." });
    }

    req.user = user; // Attach the full user object to the request
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error); // Log full error object

    // More specific error handling for JWT errors
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Unauthorized: Invalid or malformed token." });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized: Token has expired. Please log in again." });
    } else if (error.name === "NotBeforeError") {
      return res.status(401).json({ message: "Unauthorized: Token not yet active." });
    }

    // Generic fallback for any other unexpected errors
    res.status(500).json({ message: "Internal server error during authentication." });
  }
};

export default protectRoute;