import jwt from "jsonwebtoken";

import User from "../models/user.model.js";

const protectRoute = async (req, res, next) => {
  try {
    // ✅ Read from Authorization header

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided" });
    }

    const token = authHeader.split(" ")[1]; // ✅ Additional validation for token

    if (!token || token === "null" || token === "undefined") {
      return res
        .status(401)
        .json({ message: "Unauthorized - Invalid Token Format" });
    } // ✅ Check if JWT_SECRET exists

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");

      return res.status(500).json({ message: "Server configuration error" });
    } // ✅ Decode JWT with better error handling

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ Validate decoded token structure

    if (!decoded.userId) {
      return res.status(401).json({ message: "Invalid token structure" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user; // ✅ Attach user to request

    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error.message); // ✅ More specific error handling

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized - Token Expired" });
    } else if (error.name === "NotBeforeError") {
      return res
        .status(401)
        .json({ message: "Unauthorized - Token Not Active" });
    } // ✅ Generic error for other cases

    res.status(401).json({ message: "Unauthorized - Authentication Failed" });
  }
};

export default protectRoute;
