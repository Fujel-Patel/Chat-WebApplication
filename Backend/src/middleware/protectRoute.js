import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protectRoute = async (req, res, next) => {
  try {
    // ✅ Extract token from Authorization header or cookies
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    // ✅ Token presence check
    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({ message: "Unauthorized - No Valid Token Provided" });
    }

    // ✅ JWT secret validation
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // ✅ Decode and verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      return res.status(401).json({ message: "Invalid token structure" });
    }

    // ✅ Fetch user and attach to request
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    req.userId = decoded.userId; // optional, for convenience in downstream handlers
    next();
  } catch (error) {
    console.error(`[AuthError] ${error.message} - IP: ${req.ip} - URL: ${req.originalUrl}`);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized - Token Expired" });
    } else if (error.name === "NotBeforeError") {
      return res.status(401).json({ message: "Unauthorized - Token Not Active Yet" });
    }

    return res.status(401).json({ message: "Unauthorized - Authentication Failed" });
  }
};

export default protectRoute;