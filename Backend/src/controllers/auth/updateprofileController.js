import User from "../../models/user.model.js";
import cloudinary from "../../lib/cloudinary.js";

const updateProfile = async (req, res) => {
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
export default updateProfile;