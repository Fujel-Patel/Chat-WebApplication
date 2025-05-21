import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axios.get(`${VITE_API_BASE_URL}/api/message/users`, {
        withCredentials: true,
      });
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axios.get(`${VITE_API_BASE_URL}/api/message/${userId}`, {
        withCredentials: true,
      });
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) {
      toast.error("No user selected to send a message");
      return;
    }
    try {
      const res = await axios.post(
        `${VITE_API_BASE_URL}/api/message/send/${selectedUser._id}`,
        messageData,
        { withCredentials: true }
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;
    if (!selectedUser || !socket) return;

    // Remove any existing listener before adding new one
    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      const isFromSelectedUser = 
        newMessage.senderId === selectedUser._id || 
        newMessage.receiverId === selectedUser._id; // To handle both directions

      if (!isFromSelectedUser) return;

      set((state) => ({
        messages: [...state.messages, newMessage],
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser, messages: [] }), // Clear messages when changing user
}));