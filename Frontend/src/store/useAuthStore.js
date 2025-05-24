// src/store/authStore.js
import { create } from "zustand";
import  {axiosInstance}  from "../lib/axios"; // Ensure this path is correct
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// Adjust BASE_URL for socket.io connection if your API and Socket.io are on different paths
const SOCKET_BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "https://chat-webapplication-yf2z.onrender.com";

export const useAuthStore = create((set, get) => ({
  authUser: null,
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
    set({ isCheckingAuth: true }); // Ensure this is true at the start of the check
    try {
      const res = await axiosInstance.get("/auth/check"); // Assuming backend sets HTTP-only cookie
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      // If check fails (e.g., no cookie, invalid cookie), authUser should be null
      set({ authUser: null });
      // We don't toast an error here typically, as it's a silent check
      // console.log("Authentication check failed:", error); // For debugging
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
    try {
      await axiosInstance.post("/auth/logout"); // Backend should clear cookie
      set({ authUser: null });
      toast.success("Logged out successfully!");
      get().disconnectSocket(); // Disconnect socket on logout
    } catch (error) {
      get()._handleError(error, "Failed to log out.");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data); // Backend updates user, may send new cookie
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