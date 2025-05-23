import jwt from "jsonwebtoken";
// If you are using dotenv, make sure it's configured in your application's entry point (e.g., server.js)
// or ensure 'dotenv/config' is imported if this is the only place it's needed for environment variables.

export const generateToken = (userId, res) => {
  // 1. Validate JWT_SECRET existence for security
  if (!process.env.JWT_SECRET) {
    // Log the error internally, do not expose to client directly
    console.error("JWT_SECRET is not defined in environment variables. Token generation failed.");
    // Optionally throw an error or handle it more gracefully
    throw new Error("Server configuration error: JWT secret missing.");
  }

  // 2. Validate userId input
  if (!userId) {
    console.warn("Attempted to generate token for null/undefined userId.");
    throw new Error("Invalid userId provided for token generation.");
  }

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Consistent expiration time
  });

  // 3. Define cookie options clearly
  const cookieOptions = {
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Or 'Strict' for stricter security
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    // Consider adding `path: '/'` for clarity, though it's often default
  };

  res.cookie("jwt", token, cookieOptions);

  return token; // Return the token, although it's primarily used via the cookie
};