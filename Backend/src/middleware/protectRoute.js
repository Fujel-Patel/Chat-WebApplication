import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protectRoute = async (req, res, next) => {
  try {
    // ✅ Read from Authorization header instead of cookies
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    const token = authHeader.split(" ")[1];

    // ✅ Decode JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user; // ✅ Attach user to request
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error.message);
    res.status(401).json({ message: `Unauthorized: ${error.message}` });
  }
};

export default protectRoute;