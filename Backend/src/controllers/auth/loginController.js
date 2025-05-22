import { generateToken } from "../../lib/utils.js";
import User from "../../models/user.model.js";
import bcrypt from "bcryptjs";

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please enter all required fields" }); // Consistent 'message' key
    }

    const user = await User.findOne({ email });
    // Combine user not found and incorrect password for security reasons (don't reveal which is wrong)
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    generateToken(user._id, res); // Generate token and set cookie

    res.status(200).json({
      token: generateToken, // if you want to return token here
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    console.error("Error in login controller:", err.message); // Use console.error
    res.status(500).json({ message: "Internal Server Error during login." }); // Consistent 500 for server errors
  }
};

export default login;
