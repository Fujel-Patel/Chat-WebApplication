import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt; // Access the 'jwt' cookie

    if (!token) {
      // If no token is found in cookies
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    // Verify the token using the secret from environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // jwt.verify will throw an error for invalid/expired tokens, which the catch block handles.
    // This `if (!decoded)` check is technically redundant as `jwt.verify` won't return falsy on invalid token,
    // but it doesn't harm anything.
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    // Find the user associated with the decoded userId from the token
    const user = await User.findById(decoded.userId).select("-password"); // Exclude password

    if (!user) {
      // If user not found (e.g., user deleted from DB after token was issued)
      return res.status(404).json({ message: "User not found" });
    }

    // Attach the user object to the request for subsequent middleware/route handlers
    req.user = user;

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    // Catch any errors during the process (e.g., JsonWebTokenError, TokenExpiredError)
    console.log("Error in protectRoute middleware: ", error.message);
    // Return a 401 for authentication errors or 500 for other server errors
    res.status(401).json({ message: `Unauthorized: ${error.message}` }); // Provide more specific error message
  }
};

export default protectRoute;

// import jwt from "jsonwebtoken";
// import User from "../models/user.model.js";

// const protectRoute = async (req, res, next) => {
//   try {
//     const token = req.cookies.jwt;

//     if (!token) {
//       return res.status(401).json({ message: "Unauthorized - No Token Provided" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     if (!decoded) {
//       return res.status(401).json({ message: "Unauthorized - Invalid Token" });
//     }

//     const user = await User.findById(decoded.userId).select("-password");

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     req.user = user;

//     next();
//   } catch (error) {
//     console.log("Error in protectRoute middleware: ", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// export default protectRoute;