import User from "../../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../../lib/utils.js";

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all required fields" });
    }

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id); // Generate token string

    // Optionally set token in cookie:
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // });

    res.status(200).json({
      token, // Return the token string here
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    console.error("Error in login controller:", err.message);
    res.status(500).json({ message: "Internal Server Error during login." });
  }
};

export default login;