import { create } from "zustand";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import axiosInstance from "../lib/axios";

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
      const token = localStorage.getItem("token");
      if (!token || token === "null" || token === "undefined") {
        set({ authUser: null, isCheckingAuth: false });
        return;
      }

      const res = await axiosInstance.get("/api/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      localStorage.removeItem("token");
      delete axiosInstance.defaults.headers.common["Authorization"];
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/api/auth/signup", data);
      if (res.data.token && res.data.token !== "null") {
        localStorage.setItem("token", res.data.token);
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
      }

      get().socket?.disconnect();
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
      const res = await axiosInstance.post("/api/auth/login", data);
      if (res.data.token && res.data.token !== "null") {
        localStorage.setItem("token", res.data.token);
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
      }

      get().socket?.disconnect();
      set({ authUser: res.data });
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
      await axiosInstance.post("/api/auth/logout");
    } catch (error) {
      console.warn("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      delete axiosInstance.defaults.headers.common["Authorization"];
      get().disconnectSocket();
      set({ authUser: null, onlineUsers: [] });
      toast.success("Logged out successfully");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/api/auth/updateProfile", data);
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
    socket?.disconnect();

    const newSocket = io(axiosInstance.defaults.baseURL, {
      auth: { userId: authUser._id },
      withCredentials: true,
    });

    set({ socket: newSocket });

    newSocket.on("getOnlineUsers", (userIds) => set({ onlineUsers: userIds }));
    newSocket.on("disconnect", () => set({ socket: null, onlineUsers: [] }));
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
    }
  },
}));