import { generateToken } from "../../lib/utils.js";
import User from "../../models/user.js"; // Assuming user.model.js might be renamed to user.js, verify path
import bcrypt from "bcryptjs";

const signup = async (req, res) => {
  try {
    const { fullName, email, password, profilePic } = req.body;

    // 1. More Specific Input Validation
    if (!fullName) {
      return res.status(400).json({ message: "Full name is required." });
    }
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }

    // 2. Password Length Validation (Already good, no change needed)
    if (password.length < 6 || password.length > 14) {
      return res.status(400).json({ message: "Password must be between 6 and 14 characters long." });
    }

    // 3. Email Normalization and Existence Check
    const normalizedEmail = email.toLowerCase(); // Standardize email to lowercase for consistency
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: "Email already exists. Please use a different one." });
    }

    // 4. Password Hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Default Profile Picture Generation (Consider moving to a utility or client-side)
    const defaultProfilePic = `https://avatar.iran.liara.run/public?username=${encodeURIComponent(fullName.split(" ")[0])}`;

    // 6. Create New User Instance
    const newUser = new User({
      fullName,
      email: normalizedEmail, // Store normalized email
      password: hashedPassword,
      profilePic: profilePic || defaultProfilePic, // Use provided profilePic or default
    });

    // 7. Save User and Generate Token
    await newUser.save(); // Save the user *before* generating a token based on their _id

    generateToken(newUser._id, res); // Generate token and set cookie

    // 8. Successful Response
    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
  } catch (error) {
    // 9. Robust Error Logging and Generic Client Message
    console.error("Error in signup controller:", error);
    res.status(500).json({ message: "Internal Server Error during signup." });
  }
};

export default signup;