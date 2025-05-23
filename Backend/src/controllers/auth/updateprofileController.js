import User from "../../models/user.js"; // Verify path: user.model.js vs user.js
import cloudinary from "../../lib/cloudinary.js"; // Verify path

const updateProfile = async (req, res) => {
  try {
    const { fullName, profilePic } = req.body;
    const userId = req.user._id;

    // 1. Validate User ID from Token
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID not found in token." });
    }

    const updates = {};
    let userChanged = false; // Flag to track if any actual data change occurs

    // 2. Handle Profile Picture Update
    if (profilePic) {
      // Assuming `profilePic` is a data URI (base64 string) or a public URL.
      // If it's a file buffer from `multer`, the approach would be different (`stream_upload`).
      // It's good practice to validate the format of `profilePic` if it's user-provided.
      // For example, ensure it starts with 'data:image/' for base64.
      try {
        const uploadResponse = await cloudinary.uploader.upload(profilePic, {
          folder: "chat_app_profiles", // Use a specific folder
          // Consider adding `overwrite: true` if you want to replace existing images
          // for the same public_id (if you manage public_ids).
          // Or generate a new public_id to keep a history of profile pics.
        });
        updates.profilePic = uploadResponse.secure_url;
        userChanged = true;
      } catch (uploadError) {
        // Log cloudinary-specific errors
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({ message: "Failed to upload profile picture." });
      }
    }

    // 3. Handle Full Name Update
    if (fullName) {
      const trimmedFullName = fullName.trim();
      // Fetch the current user to compare against existing fullName
      // This avoids unnecessary DB write if fullName hasn't changed.
      const currentUser = await User.findById(userId).select("fullName");
      if (currentUser && trimmedFullName !== currentUser.fullName) {
        updates.fullName = trimmedFullName;
        userChanged = true;
      }
    }

    // 4. Check if any actual updates were made
    if (!userChanged) {
      // More precise message
      return res.status(400).json({ message: "No valid changes provided or detected." });
    }

    // 5. Perform Database Update
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates }, // Use $set to update only the specified fields
      { new: true, runValidators: true }
    ).select("-password");

    // 6. Handle User Not Found After Update Attempt
    if (!updatedUser) {
      // This means the user existed when we checked `currentUser` but was
      // deleted before `findByIdAndUpdate` completed, or `userId` was invalid initially.
      return res.status(404).json({ message: "User not found or unable to update." });
    }

    // 7. Success Response
    res.status(200).json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email, // Include email for consistency if needed by client
      profilePic: updatedUser.profilePic,
    });
  } catch (error) {
    // 8. Centralized Error Logging
    console.error("Error in updateProfile controller:", error);
    res.status(500).json({ message: "Internal Server Error during profile update." });
  }
};

export default updateProfile;