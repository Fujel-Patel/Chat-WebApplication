import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User } from "lucide-react";
import toast from "react-hot-toast";

function ProfilePage() {
  const { authUser, isUpdatingProfile, updateProfile, isCheckingAuth } =
    useAuthStore();

  const [fullName, setFullName] = useState("");
  const [selectedImg, setSelectedImg] = useState(null); // This will hold the Base64 URL of a newly selected image

  // Initialize fullName state from authUser when it's available or changes
  useEffect(() => {
    if (authUser) {
      setFullName(authUser.fullName || "");
    }
  }, [authUser]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      e.target.value = "";
      return toast.error("Please select a valid image file.");
    }
    if (file.size > 2 * 1024 * 1024) {
      // 2MB limit
      e.target.value = "";
      return toast.error("Image size should be less than 2MB.");
    }

    const reader = new FileReader();
    reader.onloadend = () => setSelectedImg(reader.result);
    reader.onerror = () => toast.error("Failed to read file.");
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedFields = {};

    // If a new image is selected, it takes precedence
    if (selectedImg) {
      updatedFields.profilePic = selectedImg;
    }

    // Check if full name has actually changed from the original authUser's full name
    if (fullName.trim() !== (authUser?.fullName || "").trim()) {
      updatedFields.fullName = fullName.trim();
    }

    if (Object.keys(updatedFields).length === 0) {
      return toast("No changes to update", { icon: "ℹ️" });
    }

    const success = await updateProfile(updatedFields);

    if (success) {
      setSelectedImg(null); // Clear any pending new image preview
    }
  };

  // --- NEW: Function to handle removing the profile photo ---
  const handleRemovePhoto = async () => {
    if (isUpdatingProfile) return; // Prevent multiple clicks

    // Confirm with the user before proceeding
    if (!window.confirm("Are you sure you want to remove your profile picture?")) {
      return;
    }

    // Clear any image that might have been selected but not saved yet
    setSelectedImg(null);

    // Call updateProfile with profilePic set to null
    // Your backend needs to handle 'null' for profilePic as a removal instruction.
    const success = await updateProfile({ profilePic: null });

    if (success) {
      toast.success("Profile picture removed successfully!");
      // The UI will naturally update because `authUser` in `useAuthStore` will be refreshed
      // by the `updateProfile` action from the backend's response.
    } else {
      // toast.error is already handled by useAuthStore, but you can add custom logic here
      // toast.error("Failed to remove profile picture.");
    }
  };
  // --- END NEW FUNCTION ---

  // Show loading spinner while checking auth or if authUser is not yet available
  if (isCheckingAuth || !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  // Determine which image URL to use for display:
  // 1. Newly selected image (Base64)
  // 2. Existing profile picture from authUser
  // 3. Default avatar placeholder
  const imageSource = selectedImg || authUser.profilePic || "/avatar.png";

  // Determine if we should show initials instead of an image
  const showInitials = !selectedImg && (!authUser.profilePic || authUser.profilePic === "/avatar.png");

  // Determine if the "Remove Photo" button should be visible
  const canRemovePhoto = authUser.profilePic && authUser.profilePic !== "/avatar.png";

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-base-300 rounded-xl p-6 space-y-8"
        >
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2 text-zinc-500">Update your profile info</p>
          </div>

          {/* Profile Picture & Remove Button */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {showInitials ? (
                <div className="w-32 h-32 rounded-full border-4 border-base-content flex items-center justify-center bg-base-200 text-5xl font-bold text-base-content">
                  {authUser?.fullName?.charAt(0)?.toUpperCase() || authUser?.username?.charAt(0)?.toUpperCase() || "?"}
                </div>
              ) : (
                <img
                  src={imageSource}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-base-content"
                />
              )}

              <label
                htmlFor="avatar-upload"
                aria-label="Upload profile picture"
                className={`absolute bottom-0 right-0 bg-base-content p-2 rounded-full cursor-pointer hover:scale-105 transition-all ${
                  isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                }`}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile
                ? "Updating photo..."
                : "Click the camera to change profile picture"}
            </p>

            {/* --- NEW: Remove Photo Button --- */}
            {canRemovePhoto && (
              <button
                type="button" // Important: use type="button" to prevent form submission
                onClick={handleRemovePhoto}
                className={`btn btn-error btn-outline btn-sm ${isUpdatingProfile ? "loading" : ""}`}
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? "Removing..." : "Remove Photo"}
              </button>
            )}
            {/* --- END NEW BUTTON --- */}
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label
              className="text-sm text-zinc-400 flex items-center gap-2"
              htmlFor="fullName"
            >
              <User className="w-4 h-4" /> Full Name
            </label>
            <input
              id="fullName"
              type="text"
              className="px-4 py-2.5 bg-base-200 rounded-lg border w-full"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your name"
              disabled={isUpdatingProfile}
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-1.5">
            <div className="text-sm text-zinc-400 flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email Address
            </div>
            <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
              {authUser.email || "Email not available"}
            </p>
          </div>

          {/* Save Changes */}
          <div className="text-right">
            <button
              type="submit"
              className={`btn btn-primary ${
                isUpdatingProfile ? "loading" : ""
              }`}
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;