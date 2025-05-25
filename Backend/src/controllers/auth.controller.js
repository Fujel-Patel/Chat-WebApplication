import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // generate jwt token here
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true, // MUST MATCH: If you set httpOnly: true when setting, include it here.
      secure: process.env.NODE_ENV !== "development", // MUST MATCH: True in production (HTTPS), false in dev (HTTP).
      sameSite: "None", // MUST MATCH: If you set SameSite: "None" when setting, include it here.
      expires: new Date(0), // Set to a date in the past (epoch) to ensure immediate deletion.
      // This is generally preferred over maxAge: 0 for deletion.
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not authenticated." });
    }

    const userId = req.user._id;
    const { profilePic, fullName } = req.body;

    const updates = {};

    if (profilePic) {
      if (
        typeof profilePic !== "string" ||
        !profilePic.startsWith("data:image/")
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid profile picture data. Must be a base64 image string.",
          });
      }

      let uploadResponse;
      try {
        uploadResponse = await cloudinary.uploader.upload(profilePic);
        updates.profilePic = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
        return res
          .status(500)
          .json({ message: "Failed to upload profile picture." });
      }
    }

    if (fullName) {
      if (typeof fullName !== "string" || fullName.trim().length === 0) {
        return res
          .status(400)
          .json({ message: "Full name must be a non-empty string." });
      }
      updates.fullName = fullName.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({
          message: "No profile picture or full name provided for update.",
        });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ message: "User not found or unable to update." });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateProfile controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const checkAuth = (req, res) => {
  try {
    res
      .status(200)
      .json({ _id: req.user._id,profilePic: req.user.profilePic, fullName: req.user.fullName, email: req.user.email });
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
