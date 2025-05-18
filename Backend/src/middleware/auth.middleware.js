import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default protectRoute;
// import jwt from "jsonwebtoken";
// import User from "../models/user.model.js";

// export const protectRoute = async (req, res, next) => {
//   try {
//     const token = req.cookies?.jwt;
//     if (!token)
//       return res
//         .status(400)
//         .json({ message: "Unauthorized access!No token provided" });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     if (!decoded)
//       return res
//         .status(400)
//         .json({ message: "Unauthorized access!Invalid Token" });

//     const user = await User.findById(decoded.userId).select("-password");
//     if (!user) return res.status(400).json({ message: "user not found" });

//     req.user = user; 
//     next();
//   } catch (err) {
//     console.log("error in protectroute controller" + err.message);
//     res.status(401).json({ message: "error: internal server error" + err });
//   }
// };