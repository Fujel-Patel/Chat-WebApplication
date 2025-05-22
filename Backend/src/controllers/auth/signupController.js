import { generateToken } from "../../lib/utils.js";
import User from "../../models/user.model.js";
import bcrypt from "bcryptjs";

const signup = async (req, res) => {
  const { fullName, email, password } = req.body; // Removed profilePic from destructuring as it's not directly used here before save

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Password length validation (corrected logic and message)
    if (password.length < 6 || password.length > 14) { // Corrected "between 6 to 14" logic
      return res
        .status(400)
        .json({ message: "Password length must be between 6 to 14 characters" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({ message: "Email already exists. Please try a different one." }); // 409 Conflict is more semantically correct for duplicate resource
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Default profile picture (can be defined in model or here)
    const defaultProfilePic = `https://avatar.iran.liara.run/public?username=${fullName.split(" ")[0]}`;

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      profilePic: req.body.profilePic || defaultProfilePic, // Use provided profilePic or default
    });

    // No need for `if (newUser)` check as `new User()` always returns an instance
    generateToken(newUser._id, res); // Generate token and set cookie

    await newUser.save(); // Save the new user to the database

    res.status(201).json({
      _id: newUser._id, // Changed from id to _id for consistency with Mongoose
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
  } catch (err) {
    console.error("Error in signup controller:", err.message); // Use console.error for errors
    // Provide a more generic error message to the client, log details internally
    res.status(500).json({ message: "Internal Server Error during signup." });
  }
};

export default signup;