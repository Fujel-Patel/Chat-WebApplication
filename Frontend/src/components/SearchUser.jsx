import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { X, Search, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

export const SearchUser = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const { searchUserByEmail, addContact, searchResults, isSearching, contacts } = useChatStore();

  const handleSearch = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    await searchUserByEmail(email);
  };

  const handleAddContact = async (userId) => {
    await addContact(userId);
    setEmail("");
    useChatStore.getState().clearSearchResults();
  };

  const isAlreadyContact = (userId) => {
    return contacts.some((contact) => contact._id === userId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-lg bg-base-100 p-6 shadow-lg">
        {/* Close Button */}
        <button
          onClick={() => {
            onClose();
            setEmail("");
            useChatStore.getState().clearSearchResults();
          }}
          className="absolute right-4 top-4 p-2 hover:bg-base-200 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <h2 className="mb-4 text-2xl font-bold">Add Contact by Email</h2>

        {/* Search Input */}
        <div className="mb-4 flex gap-2">
          <input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="input input-bordered flex-1"
            disabled={isSearching}
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="btn btn-primary gap-2"
          >
            <Search className="h-4 w-4" />
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Search Results */}
        <div className="space-y-3">
          {searchResults.length > 0 ? (
            searchResults.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between rounded-lg border border-base-300 p-3 hover:bg-base-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt={user.fullName}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{user.fullName}</p>
                    <p className="text-sm text-base-content/70">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddContact(user._id)}
                  disabled={isAlreadyContact(user._id)}
                  className={`btn btn-sm gap-2 ${
                    isAlreadyContact(user._id)
                      ? "btn-disabled"
                      : "btn-success"
                  }`}
                >
                  <UserPlus className="h-4 w-4" />
                  {isAlreadyContact(user._id) ? "Added" : "Add"}
                </button>
              </div>
            ))
          ) : email && !isSearching ? (
            <p className="text-center text-base-content/70 py-4">
              No users found with this email
            </p>
          ) : !email ? (
            <p className="text-center text-base-content/70 py-4">
              Enter an email to search for users
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};
