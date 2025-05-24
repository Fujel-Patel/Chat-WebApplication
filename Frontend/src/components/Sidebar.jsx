import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = () => {
  const getUsers = useChatStore((state) => state.getUsers);
  const users = useChatStore((state) => state.users);
  const selectedUser = useChatStore((state) => state.selectedUser);
  const setSelectedUser = useChatStore((state) => state.setSelectedUser);
  const isUsersLoading = useChatStore((state) => state.isUsersLoading);

  const onlineUsers = useAuthStore((state) => state.onlineUsers) || [];
  const authUser = useAuthStore((state) => state.authUser);

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    // Auto-select first user once users are loaded
    // Ensure `users` is an array and not empty before trying to select
    if (!selectedUser && users && users.length > 0) {
      const usersToConsider = showOnlineOnly
        ? users.filter((u) => onlineUsers.includes(u._id))
        : users;

      const firstUser = usersToConsider.length > 0 ? usersToConsider[0] : null;

      if (firstUser) {
        setSelectedUser(firstUser);
      }
    }
  }, [users, showOnlineOnly, selectedUser, setSelectedUser, onlineUsers]);

  // Ensure `users` is an array before filtering
  const filteredUsers = showOnlineOnly
    ? (users || []).filter((user) => onlineUsers.includes(user._id))
    : (users || []); // Ensure `users` is treated as an empty array if null/undefined

  if (isUsersLoading) return <SidebarSkeleton />;

  // Defensive check for authUser before calculating onlineCount
  const onlineCount = Math.max(onlineUsers.length - (authUser ? 1 : 0), 0);

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>

        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineCount} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3 space-y-1">
        {filteredUsers.length > 0 ? ( // Check if there are users to display
          filteredUsers.map((user) => {
            const isSelected = selectedUser?._id === user._id;
            const isOnline = onlineUsers.includes(user._id);

            // FIX: Defensive check for user.fullName before splitting
            const initials =
              typeof user.fullName === "string" && user.fullName.length > 0
                ? user.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : user.username // Fallback to username or first letter of _id
                ? user.username.charAt(0).toUpperCase()
                : ""; // Fallback to empty string if no suitable name

            return (
              <button
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`
                  w-full px-4 py-3 flex items-center gap-3 transition-all rounded-lg
                  hover:bg-base-300
                  ${isSelected ? "bg-base-300 ring-2 ring-base-300" : ""}
                `}
              >
                <div className="relative flex-shrink-0">
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt={user.fullName || user.username || "User"} // Add alt text fallback
                      className="size-12 object-cover rounded-full"
                    />
                  ) : (
                    <div className="size-12 bg-base-300 text-sm font-semibold flex items-center justify-center rounded-full">
                      {initials}
                    </div>
                  )}
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                  )}
                </div>

                <div className="hidden lg:block text-left min-w-0">
                  {/* Defensive check for user.fullName */}
                  <div className="font-medium truncate">
                    {user.fullName || user.username || "Unknown User"}
                  </div>
                  <div className="text-sm text-zinc-400">
                    {isOnline ? "Online" : "Offline"}
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="text-center text-zinc-500 py-4">No users found</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;