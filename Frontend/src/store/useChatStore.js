import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore"; // Auth store to get authUser and the socket instance

export const useChatStore = create((set, get) => ({
  // States
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false, // For message sending loading state

  // Helper function for consistent error toast messages
  _handleError: (error, defaultMessage = "Something went wrong.") => {
    console.error("API Error:", error);
    if (error.response && error.response.data && error.response.data.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error(defaultMessage);
    }
  },

  // Actions

  // 1. Get Users List
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      get()._handleError(error, "Failed to load users.");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // 2. Get Messages for Selected User
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      get()._handleError(error, "Failed to load messages.");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // 3. Send Message (axios call - socket will then emit from backend)
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();

    if (!selectedUser?._id) {
        toast.error("Please select a user to send a message.");
        return false; // Indicate failure
    }
    if (!messageData.text?.trim() && !messageData.image) {
        toast.error("Message cannot be empty.");
        return false; // Indicate failure
    }

    set({ isSendingMessage: true });
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      // Optimistically update messages array
      set({ messages: [...messages, res.data] });
      return true; // Indicate success
    } catch (error) {
      get()._handleError(error, "Failed to send message.");
      return false; // Indicate failure
    } finally {
      set({ isSendingMessage: false });
    }
  },

  // 4. Set Selected User
  setSelectedUser: (selectedUser) => set({ selectedUser }),


  // --- Socket Event Handlers (NEW: Proper way to add/remove listeners) ---
  // This action will set up the 'newMessage' listener ONLY.
  // It relies on the socket instance provided by useAuthStore.
  // This will be called in ChatContainer's useEffect.
  addMessageListener: (socket) => {
    if (!socket) return; // Ensure socket exists

    const { selectedUser } = get(); // Get current selected user when event fires
    const authUser = useAuthStore.getState().authUser; // Get authUser from authStore

    // Important: Remove any existing listener before adding a new one
    // This prevents duplicate event handlers
    socket.off("newMessage"); // Remove previous listener before adding new one

    socket.on("newMessage", (newMessage) => {
      // This listener will always be active.
      // It needs to check if the message belongs to the currently selected chat.
      if (!authUser) return; // Should not happen if socket connected after auth

      const isForMe = newMessage.receiverId === authUser._id;
      const isFromMe = newMessage.senderId === authUser._id;

      // Check if the message is for the currently selected chat
      // (a message sent by me to selected user OR received by me from selected user)
      const belongsToSelectedChat =
        (selectedUser && isForMe && newMessage.senderId === selectedUser._id) ||
        (selectedUser && isFromMe && newMessage.receiverId === selectedUser._id);


      // If the message is for the currently selected chat, add it to messages
      if (belongsToSelectedChat) {
        set((state) => ({ messages: [...state.messages, newMessage] })); // Use functional update for messages
      } else if (isForMe && !selectedUser) {
        // Optional: If no chat is selected but a new message arrives for me,
        // you might want to show a toast notification.
        // toast(`New message from ${newMessage.senderName || 'someone'}!`);
      }
    });
  },

  // This action removes the 'newMessage' listener
  removeMessageListener: (socket) => {
    if (socket) {
      socket.off("newMessage");
    }
  },
}));