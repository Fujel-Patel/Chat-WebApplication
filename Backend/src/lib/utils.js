import jwt from "jsonwebtoken";
import "dotenv/config";

export const generateToken = (userId, res) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  // Create JWT token with 7 days expiry
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // Set cookie with token, secure in production, httpOnly to prevent client-side JS access
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use HTTPS in prod
    sameSite: "None", // Required for cross-site cookies (adjust if needed)
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  return token;
};