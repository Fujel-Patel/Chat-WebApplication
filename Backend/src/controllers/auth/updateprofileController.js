import User from "../../models/user.model.js";
import cloudinary from "../../lib/cloudinary.js";

const updateProfile = async (req, res) => {
  try {
    const { profilePic, fullName } = req.body;
    const userId = req.user._id; // From protectRoute middleware

    const updates = {};

    // If profilePic is provided (base64 or URL), upload to Cloudinary
    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic, {
        folder: "chat_app_profiles",
      });
      updates.profilePic = uploadResponse.secure_url;
    }

    // Update fullName if provided and changed
    if (fullName && fullName.trim() !== req.user.fullName) {
      updates.fullName = fullName.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided for update or no changes detected.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
    });
  } catch (err) {
    console.error("Error in updateProfile controller:", err.message);
    return res.status(500).json({ message: "Internal server error during profile update." });
  }
};

export default updateProfile;