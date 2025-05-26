// src/store/authStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios"; // Ensure this path is correct
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

  // --- checkAuth action ---
  // This action correctly fetches user data and saves it to localStorage
  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      localStorage.setItem("authUser", JSON.stringify(res.data)); // Already correct
    } catch (error) {
      set({ authUser: null });
      localStorage.removeItem("authUser");
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // --- signup action (FIXED) ---
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data); // Backend should set cookie
      set({ authUser: res.data });
      // FIX: Persist authUser to localStorage on signup
      localStorage.setItem("authUser", JSON.stringify(res.data));
      toast.success("Account created successfully!");
      get().connectSocket();
      return true;
    } catch (error) {
      get()._handleError(error, "Failed to create account.");
      return false;
    } finally {
      set({ isSigningUp: false });
    }
  },

  // --- login action (FIXED) ---
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data); // Backend should set cookie
      set({ authUser: res.data });
      // FIX: Persist authUser to localStorage on login
      localStorage.setItem("authUser", JSON.stringify(res.data));
      toast.success("Logged in successfully!");
      get().connectSocket();
      return true;
    } catch (error) {
      get()._handleError(error, "Failed to log in. Please check your credentials.");
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // --- logout action (previously fixed and confirmed working) ---
  logout: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      localStorage.removeItem("authUser");
      toast.success(res.data.message || "Logged out successfully!");
      return true;
    } catch (error) {
      get()._handleError(error, "Logout failed.");
      return false;
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // --- updateProfile action (FIXED) ---
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data); // Ensure this matches backend route: "/auth/update-profile" or "/auth/updateProfile"
      set({ authUser: res.data }); // Update authUser with new profile data
      // FIX: Persist the newly updated authUser data to localStorage
      localStorage.setItem("authUser", JSON.stringify(res.data));
      toast.success("Profile updated successfully!");
      return true;
    } catch (error) {
      get()._handleError(error, "Failed to update profile.");
      return false;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // --- Socket.io connection logic (no changes here) ---
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const newSocket = io(SOCKET_BASE_URL, {
      query: { userId: authUser._id },
      withCredentials: true,
    });

    set({ socket: newSocket });

    newSocket.on("connect", () => { console.log("Socket connected:", newSocket.id); });
    newSocket.on("disconnect", () => { console.log("Socket disconnected"); set({ onlineUsers: [] }); });
    newSocket.on("getOnlineUsers", (userIds) => { set({ onlineUsers: userIds }); });
    newSocket.on("connect_error", (error) => { console.error("Socket connection error:", error.message); });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket && socket.connected) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
      console.log("Socket disconnected successfully.");
    }
  },
}));