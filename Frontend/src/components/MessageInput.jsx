// src/store/useChatStore.js (hypothetical structure)
import { create } from 'zustand';
import axios from 'axios'; // Or your custom axios instance
import { useAuthStore } from './useAuthStore'; // If you need authUser

const API_BASE_URL = import.meta.env.MODE === "development"
  ? "http://localhost:5000/api"
  : "https://chat-webapplication-yf2z.onrender.com/api";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isMessagesLoading: false,
  // ... other state

  // This is the function called by MessageInput
  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    const { authUser } = useAuthStore.getState(); // Access authUser directly

    if (!selectedUser) {
      console.error("No user selected to send message to.");
      toast.error("Please select a user to chat with.");
      return;
    }

    if (!authUser) {
        console.error("No authenticated user to send message from.");
        toast.error("Please log in to send messages.");
        return;
    }

    try {
      // --- POTENTIAL PROBLEM AREA IF YOU MANIPULATE messageData.text OR messageData.image HERE ---
      // For example, if you were trying to do something like:
      // const processedText = messageData.text.someMethod().split(' '); // This would fail if messageData.text is empty string, or not a string.
      // Or if you were doing any validation on messageData.image that called .split() on it.

      const response = await axios.post(`${API_BASE_URL}/messages/${selectedUser._id}`, {
        text: messageData.text,
        image: messageData.image, // This is already base64 or null
        senderId: authUser._id, // Assuming your backend expects this
        receiverId: selectedUser._id, // Assuming your backend expects this
      }, {
        withCredentials: true // Essential for sending cookies
      });

      // Optimistically update UI or fetch messages
      // set((state) => ({ messages: [...state.messages, response.data.newMessage] }));
      // Or re-fetch all messages
      get().getMessages(selectedUser._id); // Re-fetch to include the new message
      toast.success("Message sent!");

    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message: " + (error.response?.data?.message || error.message));
    }
  },

  // ... other actions like getUsers, getMessages, subscribeToMessages, etc.
}));