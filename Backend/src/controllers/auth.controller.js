import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js"; // Make sure cloudinary is correctly configured to use process.env vars

export const signup = async (req, res) => {
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

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all required fields" }); // Consistent 'message' key
    }

    const user = await User.findOne({ email });
    // Combine user not found and incorrect password for security reasons (don't reveal which is wrong)
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    generateToken(user._id, res); // Generate token and set cookie

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (err) {
    console.error("Error in login controller:", err.message); // Use console.error
    res.status(500).json({ message: "Internal Server Error during login." }); // Consistent 500 for server errors
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 }); // Clear the jwt cookie
    res.status(200).json({ message: "Logout successful" }); // Consistent 'message' key
  } catch (err) {
    console.error("Error in logout controller:", err.message); // Use console.error
    res.status(500).json({ message: "Internal Server Error during logout." }); // Consistent 500 for server errors
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, fullName } = req.body;
    const userId = req.user._id; // Assuming req.user contains the authenticated user's info from protectRoute

    const updates = {}; // Initialize an object to hold the fields that need to be updated

    // Update the profile picture if provided
    if (profilePic) {
      // Basic check to see if it's a base64 string or a URL from client
      // Cloudinary upload expects a data URI (base64) or a URL.
      // If it's a local file path, you'd need multer.
      // Assuming 'profilePic' from req.body is already a data URI or a URL for direct upload
      const uploadResponse = await cloudinary.uploader.upload(profilePic, {
        folder: "chat_app_profiles", // Use a specific folder name
        // Optional: public_id, transformation, etc.
      });
      updates.profilePic = uploadResponse.secure_url; // Set the secure URL from Cloudinary
    }

    // Update the full name if provided and it's different
    if (fullName && fullName.trim() !== req.user.fullName) { // Only update if changed
      updates.fullName = fullName.trim(); // Trim to avoid extra spaces
    }

    // If no valid fields are provided for update, return a bad request response
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided for update or no changes detected.",
      });
    }

    // Update the user's profile in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true } // Return the updated document and run Mongoose validators
    ).select("-password"); // Exclude password from the returned object

    // If the user doesn't exist or can't be updated, send a 404
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
    }); // Send the updated user data back
  } catch (err) {
    console.error("Error in updateProfile controller:", err.message); // Use console.error
    res.status(500).json({ message: "Internal server error during profile update." });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found or unauthorized" });
    }

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error in checkAuth controller:", error.message);
    res.status(500).json({ message: "Internal Server Error during authentication check." });
  }
};