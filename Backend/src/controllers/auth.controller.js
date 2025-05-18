import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";


export const signup = async (req, res) => {
  const { fullName, email, password, profilePic } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length > 6 && password.length < 16) {
      return res
        .status(400)
        .json({ message: "password length must between 6 to 14 characters" });
    }

    const user = await User.findOne({ email });
    if (user)
      return res
        .status(400)
        .json({ message: "email already exist try different" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });
    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      return res.status(400).json({ message: "invalid user data" });
    }
  } catch (err) {
    return res.status(400).json({ message: "error" + err });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ errorMessage: "Please enter all required fields" });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "user not found:" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credential" });
    }

    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (err) {
    console.log("error in login controller" + err.message);
    res.status(401).json({ message: "error: internal server error" + err });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logout successfull" });
  } catch (err) {
    console.log("error in login controller" + err.message);
    res.status(401).json({ message: "error: internal server error" + err });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, fullName } = req.body;
    const userId = req.user._id; // Assuming req.user contains the authenticated user's info

    // Initialize an object to hold the fields that need to be updated
    const updates = {};

    // Update the profile picture if provided
    if (profilePic) {
      // Upload the profile picture to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(profilePic, {
        folder: "profiles", // Optional: upload to a specific folder
      });
      updates.profilePic = uploadResponse.secure_url; // Set the secure URL from Cloudinary
    }

    // Update the full name if provided
    if (fullName) {
      updates.fullName = fullName.trim(); // Trim to avoid extra spaces
    }

    // If no valid fields are provided for update, return a bad request response
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "error: no valid fields provided to update",
      });
    }

    // Update the user's profile in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true } // Return the updated document
    );

    // If the user doesn't exist or can't be updated, send a 404
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ updatedUser });
  } catch (err) {
    console.error("Error in updateProfile:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.status(200).json(user); // 👈 Send full user object
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
