// src/store/authStore.js
import { create } from "zustand";
import  {axiosInstance}  from "../lib/axios"; // Ensure this path is correct
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// Adjust BASE_URL for socket.io connection if your API and Socket.io are on different paths
const SOCKET_BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "https://chat-webapplication-yf2z.onrender.com";

export const useAuthStore = create((set, get) => ({
  authUser: JSON.parse(localStorage.getItem("authUser")) || null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true, // Keep true initially for app startup
  onlineUsers: [],
  socket: null, // Holds the socket.io client instance

  // Helper function for consistent error toast messages
  _handleError: (error, defaultMessage = "Something went wrong!") => {
    console.error("API Error:", error);
    toast.error(error.response?.data?.message || defaultMessage);
  },

   checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      localStorage.setItem("authUser", JSON.stringify(res.data)); // Ensure authUser is saved to localStorage
    } catch (error) {
      set({ authUser: null }); // Clear authUser on checkAuth failure
      localStorage.removeItem("authUser"); // Clear localStorage on checkAuth failure
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data); // Backend should set cookie
      set({ authUser: res.data });
      toast.success("Account created successfully!");
      get().connectSocket();
      return true; // Indicate success
    } catch (error) {
      get()._handleError(error, "Failed to create account.");
      return false; // Indicate failure
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data); // Backend should set cookie
      set({ authUser: res.data });
      toast.success("Logged in successfully!");
      get().connectSocket();
      return true; // Indicate success
    } catch (error) {
      get()._handleError(error, "Failed to log in. Please check your credentials.");
      return false; // Indicate failure
    } finally {
      set({ isLoggingIn: false });
    }
  },

 logout: async () => {
    set({ isCheckingAuth: true }); // Optional: set loading state for logout
    try {
      // 1. Send logout request to backend (this clears the cookie)
      const res = await axiosInstance.post("/auth/logout");

      // 2. CRITICAL: Clear authUser state in Zustand
      set({ authUser: null });

      // 3. CRITICAL: Clear authUser from localStorage
      localStorage.removeItem("authUser");

      // 4. Provide user feedback
      toast.success(res.data.message || "Logged out successfully!"); // Backend usually sends a message

      return true; // Indicate success
    } catch (error) {
      // Use your centralized error handler
      get()._handleError(error, "Logout failed.");
      return false; // Indicate failure
    } finally {
      set({ isCheckingAuth: false }); // Reset loading state
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/updateProfile", data); // Backend updates user, may send new cookie
      set({ authUser: res.data }); // Update authUser with new profile data
      toast.success("Profile updated successfully!");
      return true; // Indicate success
    } catch (error) {
      get()._handleError(error, "Failed to update profile.");
      return false; // Indicate failure
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    // Only connect if authUser exists and socket is not already connected or connecting
    if (!authUser || get().socket?.connected) return;

    const newSocket = io(SOCKET_BASE_URL, {
      query: {
        userId: authUser._id, // Ensure authUser has _id property
      },
      withCredentials: true, // Important if your socket.io server also relies on cookies
    });

    // Set the socket instance in the store
    set({ socket: newSocket });

    // Listen for events
    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      set({ onlineUsers: [] }); // Clear online users on disconnect
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error.message);
        // Handle connection errors (e.g., if server is down)
    });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket && socket.connected) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [] }); // Clear socket and online users state
      console.log("Socket disconnected successfully.");
    }
  },
}));