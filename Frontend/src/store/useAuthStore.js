import { create } from "zustand";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import axios from "axios";

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Setup default axios authorization header if token exists
const token = localStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axios.get(`${VITE_API_BASE_URL}/api/auth/check`);
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axios.post(
        `${VITE_API_BASE_URL}/api/auth/signup`,
        data
      );

      // Save JWT token
      localStorage.setItem("token", res.data.token);
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${res.data.token}`;

      // Disconnect previous socket if exists
      const prevSocket = get().socket;
      if (prevSocket) prevSocket.disconnect();

      set({ authUser: res.data.user });
      get().connectSocket();
      toast.success("Account created successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axios.post(`${VITE_API_BASE_URL}/api/auth/login`, data);

      // Save JWT token
      localStorage.setItem("token", res.data.token);
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${res.data.token}`;

      // Disconnect previous socket if exists
      const prevSocket = get().socket;
      if (prevSocket) prevSocket.disconnect();

      set({ authUser: res.data.user });
      get().connectSocket();
      toast.success("Logged in successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axios.post(`${VITE_API_BASE_URL}/api/auth/logout`);

      // Clear token and headers
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];

      get().disconnectSocket();
      set({ authUser: null, onlineUsers: [] });
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Logout failed");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axios.put(
        `${VITE_API_BASE_URL}/api/auth/updateProfile`,
        data
      );
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser?._id) return;

    // Disconnect existing socket to avoid duplicates
    if (socket) {
      socket.disconnect();
    }

    const newSocket = io(VITE_API_BASE_URL, {
      auth: { userId: authUser._id },
      withCredentials: true,
    });

    set({ socket: newSocket });

    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    newSocket.on("disconnect", () => {
      set({ socket: null, onlineUsers: [] });
    });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
    }
  },
}));
