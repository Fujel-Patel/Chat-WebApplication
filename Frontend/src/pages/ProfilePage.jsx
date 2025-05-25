import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, CircleUserRound } from "lucide-react";
import toast from "react-hot-toast";

function ProfilePage() {
  const { authUser, isUpdatingProfile, updateProfile, isCheckingAuth } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [fullName, setFullName] = useState(""); // State for the input field

  // Initialize fullName state from authUser's fullName when authUser changes
  useEffect(() => {
    if (authUser?.fullName) {
      setFullName(authUser.fullName);
    }
  }, [authUser]); // Depend on authUser to re-initialize if it changes

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      e.target.value = ''; // Clear the input field to allow re-selection
      return toast.error("Please select a valid image file");
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      e.target.value = ''; // Clear the input field
      return toast.error("Image size should be less than 2MB");
    }

    const reader = new FileReader();
    reader.onloadend = () => setSelectedImg(reader.result);
    reader.onerror = () => toast.error("Failed to read file");
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedFields = {};

    // Check if a new image was selected
    // Comparing selectedImg (base64) with authUser.profilePic (URL) directly won't work.
    // Just check if selectedImg has a value, indicating a new file was chosen.
    if (selectedImg) { // If selectedImg is not null, it means a new image was chosen
      updatedFields.profilePic = selectedImg;
    }

    // Check if full name has changed from the original authUser's full name
    // Trim both for robust comparison, and handle cases where authUser.fullName might be undefined/null
    if (fullName.trim() !== (authUser?.fullName || "").trim()) {
      updatedFields.fullName = fullName.trim();
    }

    if (Object.keys(updatedFields).length === 0) {
      return toast("No changes to update", { icon: 'ℹ️' }); // Use an info icon for no changes
    }

    // Call updateProfile from useAuthStore.
    // The updateProfile action already handles its own toast.success/error
    // and returns a boolean (true for success, false for failure).
    const success = await updateProfile(updatedFields);

    if (success) {
      // No need for toast.success here, useAuthStore already handles it
      setSelectedImg(null); // Clear temporary selected image after successful update
      // The `fullName` state will be re-initialized by the useEffect after authUser updates
    } else {
      // No need for toast.error here, useAuthStore already handles it via _handleError
    }
  };

  // Show loading spinner while checking auth or if authUser is not yet available
  if (isCheckingAuth || !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  // Determine which image to display: the temporarily selected one or the current profile pic
  const displayImg = selectedImg || authUser.profilePic || "/avatar.png"; // Fallback to a default avatar

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <form onSubmit={handleSubmit} className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2 text-zinc-500">Update your profile info</p>
          </div>

          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={displayImg} // Use displayImg
                alt="User profile picture"
                className="w-32 h-32 rounded-full object-cover border-4 border-base-content"
              />

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
              {isUpdatingProfile ? "Updating photo..." : "Click the camera to change profile picture"}
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-400 flex items-center gap-2" htmlFor="fullName">
              <User className="w-4 h-4" /> Full Name
            </label>
            <input
              id="fullName"
              type="text"
              className="px-4 py-2.5 bg-base-200 rounded-lg border w-full"
              value={fullName} // Bind to local `fullName` state
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
            {/* Display email from authUser, with fallback */}
            <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser.email || "Email not available"}</p>
          </div>

          {/* Save Changes */}
          <div className="text-right">
            <button
              type="submit"
              className={`btn btn-primary ${isUpdatingProfile ? "loading" : ""}`}
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