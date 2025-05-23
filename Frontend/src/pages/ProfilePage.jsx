import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, CircleUserRound } from "lucide-react";
import toast from "react-hot-toast";

function ProfilePage() {
  const { authUser, isUpdatingProfile, updateProfile, isCheckingAuth } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (authUser?.fullName) setFullName(authUser.fullName);
  }, [authUser]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Please select a valid image file");
    }
    if (file.size > 2 * 1024 * 1024) {
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

    if (selectedImg && selectedImg !== authUser.profilePic) {
      updatedFields.profilePic = selectedImg;
    }

    if (fullName.trim() && fullName.trim() !== authUser.fullName) {
      updatedFields.fullName = fullName.trim();
    }

    if (Object.keys(updatedFields).length === 0) {
      return toast("No changes to update");
    }

    try {
      await updateProfile(updatedFields);
      toast.success("Profile updated successfully");
      setSelectedImg(null); // clear temporary selected image
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  if (isCheckingAuth || !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  const displayImg = selectedImg || authUser.profilePic;

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
              {displayImg ? (
                <img
                  src={displayImg}
                  alt="User profile picture"
                  className="w-32 h-32 rounded-full object-cover border-4 border-base-content"
                />
              ) : (
                <CircleUserRound className="w-32 h-32 text-zinc-500" />
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