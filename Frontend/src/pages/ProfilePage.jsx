import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { Camera, Mail, User, LogOut, Palette, Lock, Calendar, Zap } from "lucide-react";
import toast from "react-hot-toast";

function ProfilePage() {
  const { authUser, isUpdatingProfile, updateProfile, isCheckingAuth, logout } =
    useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const [fullName, setFullName] = useState("");
  const [selectedImg, setSelectedImg] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

    // Validate full name
    const trimmedName = fullName.trim();
    if (trimmedName.length < 2) {
      return toast.error("Full name must be at least 2 characters.");
    }
    if (trimmedName.length > 50) {
      return toast.error("Full name cannot exceed 50 characters.");
    }

    // If a new image is selected, it takes precedence
    if (selectedImg) {
      updatedFields.profilePic = selectedImg;
    }

    // Check if full name has actually changed from the original authUser's full name
    if (trimmedName !== (authUser?.fullName || "").trim()) {
      updatedFields.fullName = trimmedName;
    }

    if (Object.keys(updatedFields).length === 0) {
      return toast("No changes to update", { icon: "ℹ️" });
    }

    const success = await updateProfile(updatedFields);

    if (success) {
      setSelectedImg(null); // Clear any pending new image preview
    }
  };

  const handleRemovePhoto = async () => {
    if (isUpdatingProfile) return;

    if (!window.confirm("Are you sure you want to remove your profile picture?")) {
      return;
    }

    setSelectedImg(null);
    const success = await updateProfile({ profilePic: null });

    if (success) {
      toast.success("Profile picture removed successfully!");
    }
  };

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) {
      return;
    }

    setIsLoggingOut(true);
    try {
      await logout();
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme}!`);
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    let completion = 0;
    if (authUser?.email) completion += 25;
    if (authUser?.fullName) completion += 25;
    if (authUser?.profilePic && authUser.profilePic !== "/avatar.png") completion += 50;
    return completion;
  };

  // Format account creation date
  const formatCreatedDate = (date) => {
    if (!date) return "N/A";
    const created = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return created.toLocaleDateString();
  };

  // Show loading spinner while checking auth or if authUser is not yet available
  if (isCheckingAuth || !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  const imageSource = selectedImg || authUser.profilePic || "/avatar.png";
  const showInitials = !selectedImg && (!authUser.profilePic || authUser.profilePic === "/avatar.png");
  const canRemovePhoto = authUser.profilePic && authUser.profilePic !== "/avatar.png";
  const profileCompletion = calculateProfileCompletion();
  const themes = ["business", "dark", "light", "cupcake", "bumblebee", "emerald"];

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-zinc-500 mt-1">Manage your account settings</p>
        </div>

        {/* Profile Completion Progress */}
        <div className="card bg-base-300 shadow-md">
          <div className="card-body">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-warning" />
                Profile Completion
              </h3>
              <span className="text-sm font-bold text-primary">{profileCompletion}%</span>
            </div>
            <progress className="progress progress-primary w-full" value={profileCompletion} max="100"></progress>
            <p className="text-xs text-zinc-500 mt-2">
              {profileCompletion === 100 
                ? "✨ Your profile is complete!" 
                : `Complete your profile to get started ${profileCompletion === 0 ? "- " + (100 - profileCompletion) + "% remaining" : ""}`}
            </p>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="card bg-base-300 shadow-md">
          <div className="card-body space-y-6">
            {/* Personal Information Section */}
            <div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h2>

              {/* Profile Picture */}
              <div className="mb-6">
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

                  {canRemovePhoto && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className={`btn btn-error btn-outline btn-sm ${isUpdatingProfile ? "loading" : ""}`}
                      disabled={isUpdatingProfile}
                    >
                      {isUpdatingProfile ? "Removing..." : "Remove Photo"}
                    </button>
                  )}
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-semibold text-zinc-400">Full Name</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  disabled={isUpdatingProfile}
                  maxLength={50}
                />
                <p className="text-xs text-zinc-500">{fullName.length}/50 characters</p>
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  className="input input-bordered w-full bg-base-200 cursor-not-allowed"
                  value={authUser.email || "Email not available"}
                  disabled
                  readOnly
                />
                <p className="text-xs text-zinc-500">Email cannot be changed</p>
              </div>
            </div>

            {/* Divider */}
            <div className="divider my-2"></div>

            {/* Account Settings Section */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Theme & Appearance
              </h3>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-400">Color Theme</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {themes.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleThemeChange(t)}
                      className={`btn btn-sm capitalize ${
                        theme === t ? "btn-primary" : "btn-outline"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="divider my-2"></div>

            {/* Account Information */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Account Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-base-100 rounded-lg p-4">
                  <p className="text-xs text-zinc-500 mb-1">Member Since</p>
                  <p className="font-semibold">{formatCreatedDate(authUser.createdAt)}</p>
                </div>
                <div className="bg-base-100 rounded-lg p-4">
                  <p className="text-xs text-zinc-500 mb-1">Account Status</p>
                  <p className="font-semibold text-success">Active</p>
                </div>
                <div className="bg-base-100 rounded-lg p-4">
                  <p className="text-xs text-zinc-500 mb-1">User ID</p>
                  <p className="font-mono text-sm break-all">{authUser._id}</p>
                </div>
                <div className="bg-base-100 rounded-lg p-4">
                  <p className="text-xs text-zinc-500 mb-1">Profile Status</p>
                  <p className="font-semibold">{profileCompletion}% Complete</p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="divider my-2"></div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
              <button
                type="button"
                onClick={handleLogout}
                className={`btn btn-error btn-outline ${isLoggingOut ? "loading" : ""}`}
                disabled={isLoggingOut || isUpdatingProfile}
              >
                <LogOut className="w-4 h-4" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
              <button
                type="submit"
                className={`btn btn-primary ${isUpdatingProfile ? "loading" : ""}`}
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;