import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,

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
  },

  removeMessageListener: (socket) => {
    if (socket) {
      socket.off("newMessage");
    }
  },
}));