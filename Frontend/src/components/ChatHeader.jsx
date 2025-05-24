import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  // CRITICAL FIX: Render nothing or a placeholder if no user is selected
  // This prevents accessing properties of `undefined` or `null`
  if (!selectedUser) {
    return (
      <div className="p-2.5 border-b border-base-300 flex items-center justify-center h-full">
        <p className="text-lg text-gray-500">No chat selected</p>
      </div>
    );
  }

  // Ensure onlineUsers is an array to use .includes safely
  const onlineUsersArray = onlineUsers || [];
  const isUserOnline = onlineUsersArray.includes(selectedUser._id);

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              {/* Use optional chaining or fallback for profilePic and alt text */}
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName || selectedUser.username || "User Profile"}
              />
            </div>
          </div>

          {/* User info */}
          <div>
            {/* Defensive check for fullName */}
            <h3 className="font-medium">{selectedUser.fullName || selectedUser.username || "Unknown User"}</h3>
            <p className="text-sm text-base-content/70">
              {isUserOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close button */}
        {/* Only show if a user is selected */}
        <button onClick={() => setSelectedUser(null)} className="btn btn-ghost btn-circle btn-sm">
          <X size={20} />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;