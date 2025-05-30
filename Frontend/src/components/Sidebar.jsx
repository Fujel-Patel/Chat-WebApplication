import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const getUsers = useChatStore((state) => state.getUsers);
  const users = useChatStore((state) => state.users);
  const selectedUser = useChatStore((state) => state.selectedUser);
  const setSelectedUser = useChatStore((state) => state.setSelectedUser);
  const isUsersLoading = useChatStore((state) => state.isUsersLoading);

  const onlineUsers = useAuthStore((state) => state.onlineUsers) || [];
  const authUser = useAuthStore((state) => state.authUser);

  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    if (!selectedUser && users && users.length > 0) {
      const visible = filteredUsers();
      if (visible.length > 0) {
        setSelectedUser(visible[0]);
      }
    }
  }, [users, selectedUser, showOnlineOnly, searchTerm]);

  const filteredUsers = () => {
    let filtered = users || [];

    if (showOnlineOnly) {
      filtered = filtered.filter((u) => onlineUsers.includes(u._id));
    }

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((u) =>
        (u.fullName || u.username || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const groupedUsers = () => {
    const online = [];
    const offline = [];

    filteredUsers().forEach((user) => {
      if (onlineUsers.includes(user._id)) online.push(user);
      else offline.push(user);
    });

    return { online, offline };
  };

  const { online, offline } = groupedUsers();

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>

        {/* Search */}
        <div className="mt-4 hidden lg:flex items-center gap-2">
          <Search className="size-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search"
            className="input input-sm w-full input-bordered"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Toggle */}
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
          <span className="text-xs text-zinc-500">
            ({Math.max(online.length - 1, 0)} online)
          </span>
        </div>
      </div>

      {/* User List */}
      <div className="overflow-y-auto w-full py-3 space-y-4 px-2">
        {[["Online", online], ["Offline", offline]].map(([label, list]) =>
          list.length > 0 ? (
            <div key={label}>
              <p className="text-xs text-zinc-400 uppercase font-semibold pl-2 mb-1 hidden lg:block">
                {label}
              </p>
              <AnimatePresence>
                {list.map((user) => {
                  const isSelected = selectedUser?._id === user._id;
                  const isOnline = onlineUsers.includes(user._id);
                  const initials =
                    user.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ||
                    user.username?.charAt(0).toUpperCase() ||
                    "?";

                  return (
                    <motion.button
                      key={user._id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setSelectedUser(user)}
                      className={`
                        w-full px-3 py-2 flex items-center gap-3 rounded-lg transition-all
                        hover:bg-base-300
                        ${isSelected ? "bg-base-300 ring-2 ring-base-300" : ""}
                      `}
                    >
                      <div className="relative">
                        {user.profilePic ? (
                          <img
                            src={user.profilePic}
                            alt={user.fullName || "User"}
                            className="size-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="size-10 bg-base-300 flex items-center justify-center rounded-full text-sm font-semibold">
                            {initials}
                          </div>
                        )}
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                        )}
                      </div>

                      <div className="hidden lg:block text-left min-w-0">
                        <p className="truncate font-medium">
                          {user.fullName || user.username || "Unknown"}
                        </p>
                        <p className="text-xs text-zinc-500">{isOnline ? "Online" : "Offline"}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : null
        )}
      </div>
    </aside>
  );
};

export default Sidebar;