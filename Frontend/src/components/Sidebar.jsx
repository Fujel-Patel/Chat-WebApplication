import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { SearchUser } from "./SearchUser";
import { Users, Search, UserPlus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const getContacts = useChatStore((state) => state.getContacts);
  const contacts = useChatStore((state) => state.contacts);
  const removeContact = useChatStore((state) => state.removeContact);
  const selectedUser = useChatStore((state) => state.selectedUser);
  const setSelectedUser = useChatStore((state) => state.setSelectedUser);
  const isUsersLoading = useChatStore((state) => state.isUsersLoading);

  const onlineUsers = useAuthStore((state) => state.onlineUsers) || [];
  const authUser = useAuthStore((state) => state.authUser);

  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  useEffect(() => {
    getContacts();
  }, [getContacts]);

  const getVisibleContacts = () => {
    let filtered = contacts || [];

    if (authUser) {
      filtered = filtered.filter((u) => u._id !== authUser._id);
    }

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

    const online = filtered
      .filter((user) => onlineUsers.includes(user._id))
      .map((user) => ({ ...user, status: "online" }));

    const offline = filtered
      .filter((user) => !onlineUsers.includes(user._id))
      .map((user) => ({ ...user, status: "offline" }));

    return [...online, ...offline];
  };

  const visibleContacts = getVisibleContacts();
  const onlineCount = visibleContacts.filter((u) => u.status === "online").length;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Header section */}
      <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 w-full p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="size-6" />
            <span className="font-medium lg:block">My Contacts</span>
          </div>
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="btn btn-sm btn-primary gap-2"
            title="Add new contact by email"
          >
            <UserPlus className="size-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>

        {/* Search Input (hidden on mobile, visible on lg screens) */}
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

        {/* Show Online Only Toggle (hidden on mobile, visible on lg screens) */}
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
            ({Math.max(onlineCount, 0)} online)
          </span>
        </div>
      </div>

      {/* Main content area: Contact List or "No Contacts Found" Message */}
      <div
        className="flex-1 overflow-y-auto w-full py-3 px-2
                   grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-0
                   "
      >
        <AnimatePresence>
          {visibleContacts.length > 0 ? (
            <>
              {visibleContacts.filter((u) => u.status === "online").length > 0 && (
                <p className="text-xs text-zinc-400 uppercase font-semibold pl-2 mb-1 hidden lg:block">
                  Online
                </p>
              )}

              {visibleContacts.map((user) => {
                const isSelected = selectedUser?._id === user._id;
                const isOnline = user.status === "online";
                const initials =
                  user.fullName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) ||
                  user.username?.charAt(0).toUpperCase() ||
                  "?";

                return (
                  <motion.div
                    key={user._id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="group relative"
                  >
                    <button
                      onClick={() => setSelectedUser(user)}
                      className={`
                        w-full px-3 py-2 flex items-center gap-3 rounded-lg transition-all
                        hover:bg-base-300
                        ${isSelected ? "bg-base-300 ring-2 ring-base-300" : ""}
                        ${!isOnline ? "opacity-50" : ""}
                        flex
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

                      <div className="flex-1 text-left min-w-0">
                        <p className="truncate font-medium">
                          {user.fullName || user.username || "Unknown"}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {isOnline ? "Online" : "Offline"}
                        </p>
                      </div>
                    </button>

                    {/* Remove button - visible on hover */}
                    <button
                      onClick={() => removeContact(user._id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:bg-error/20 rounded transition-all duration-200"
                      title="Remove contact"
                    >
                      <X className="size-4 text-error" />
                    </button>
                  </motion.div>
                );
              })}
            </>
          ) : (
            <motion.div
              key="no-contacts-message"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4 w-full"
            >
              <p className="text-lg">No contacts yet.</p>
              <p className="text-sm mt-2">
                Click the "Add" button to search and add users by email.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search User Modal */}
      <SearchUser isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </aside>
  );
};

export default Sidebar;
