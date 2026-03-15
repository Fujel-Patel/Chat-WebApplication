import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  contacts: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,
  isSearching: false,
  searchResults: [],

  _handleError: (error, defaultMessage = "Something went wrong.") => {
    console.error("API Error:", error);
    if (error.response && error.response.data && error.response.data.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error(defaultMessage);
    }
  },

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

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();

    if (!selectedUser?._id) {
      toast.error("Please select a user to send a message.");
      return false;
    }
    if (!messageData.text?.trim() && !messageData.image) {
      toast.error("Message cannot be empty.");
      return false;
    }

    set({ isSendingMessage: true });
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
      return true;
    } catch (error) {
      get()._handleError(error, "Failed to send message.");
      return false;
    } finally {
      set({ isSendingMessage: false });
    }
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    if (!selectedUser) {
      set({ messages: [] });
    }
  },

  addMessageListener: (socket) => {
    if (!socket) return;

    const { selectedUser } = get();
    const authUser = useAuthStore.getState().authUser;

    socket.off("newMessage");
    socket.off("messageDelivered");
    socket.off("messagesRead");

    socket.on("newMessage", (newMessage) => {
      if (!authUser) return;

      const isForMe = newMessage.receiverId === authUser._id;
      const isFromMe = newMessage.senderId === authUser._id;

      const belongsToSelectedChat =
        (selectedUser && isForMe && newMessage.senderId === selectedUser._id) ||
        (selectedUser && isFromMe && newMessage.receiverId === selectedUser._id);

      if (belongsToSelectedChat) {
        set((state) => ({ messages: [...state.messages, newMessage] }));
      }
    });

    // Handle message delivered status update
    socket.on("messageDelivered", ({ messageId, status, deliveredAt }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId
            ? { ...msg, status, deliveredAt }
            : msg
        ),
      }));
    });

    // Handle messages read status update
    socket.on("messagesRead", ({ senderId, receiverId, status, readAt }) => {
      if (!authUser) return;
      
      // Only update if these read messages are from the selected chat
      if (selectedUser && senderId.toString() === selectedUser._id.toString()) {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.senderId === authUser._id && msg.receiverId === senderId
              ? { ...msg, status, readAt }
              : msg
          ),
        }));
      }
    });
  },

  removeMessageListener: (socket) => {
    if (socket) {
      socket.off("newMessage");
      socket.off("messageDelivered");
      socket.off("messagesRead");
    }
  },

  // Contact management functions
  getContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ contacts: res.data });
    } catch (error) {
      get()._handleError(error, "Failed to load contacts.");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  searchUserByEmail: async (email) => {
    if (!email || email.trim() === "") {
      set({ searchResults: [] });
      return;
    }

    set({ isSearching: true });
    try {
      const res = await axiosInstance.get("/messages/search", {
        params: { email: email.toLowerCase() },
      });
      set({ searchResults: [res.data] });
    } catch (error) {
      if (error.response?.status === 404) {
        set({ searchResults: [] });
        toast.error("User not found.");
      } else {
        get()._handleError(error, "Search failed.");
      }
    } finally {
      set({ isSearching: false });
    }
  },

  addContact: async (contactId) => {
    try {
      await axiosInstance.post(`/messages/contacts/${contactId}`);
      // Refresh contacts and users lists
      await get().getContacts();
      toast.success("Contact added successfully!");
    } catch (error) {
      get()._handleError(error, "Failed to add contact.");
    }
  },

  removeContact: async (contactId) => {
    try {
      await axiosInstance.delete(`/messages/contacts/${contactId}`);
      // Refresh contacts list
      await get().getContacts();
      toast.success("Contact removed successfully!");
    } catch (error) {
      get()._handleError(error, "Failed to remove contact.");
    }
  },

  clearSearchResults: () => {
    set({ searchResults: [] });
  },

  markMessagesAsRead: async (senderId) => {
    try {
      await axiosInstance.post(`/messages/read/${senderId}`);
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  },
}));