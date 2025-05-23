import User from "../../models/user.model.js";

const checkAuth = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Authentication failed: User ID not provided in token." });
    }

    const userId = req.user._id;

    const user = await User.findById(userId).select("fullName email profilePic");

    if (!user) {
      return res.status(401).json({ message: "User not found or unauthorized. Please re-login." });
    }

    const userData = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    };

    res.status(200).json(userData);
  } catch (error) {
    console.error("Error in checkAuth controller:", error);
    res.status(500).json({ message: "Internal Server Error during authentication check." });
  }
};

export default checkAuth;