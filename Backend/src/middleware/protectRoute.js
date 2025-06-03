// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.jwt) {
    // Check if cookie exists
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select("-password"); // Assuming userId in token
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    // Clear the cookie on invalid token for a clean state
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    });
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
