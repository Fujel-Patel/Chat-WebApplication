import { create } from "zustand";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import axios from "axios";

const VITE_API_BASE_URL = "https://chat-webapplication-yf2z.onrender.com";

// ✅ Fixed: Only set authorization header if token exists and is valid
const token = localStorage.getItem("token");
if (token && token !== "null" && token !== "undefined") {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// ✅ Add axios interceptor to handle token errors globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      
      // Optional: You can dispatch a logout action here if needed
      console.log("Token expired or invalid, cleared from storage");
    }
    return Promise.reject(error);
  }
);

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

    // Make sure Authorization header is set before this call
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const res = await axios.get(`${VITE_API_BASE_URL}/api/auth/check`, {
  headers: { Authorization: `Bearer ${token}` },
});

    // Fix here: set authUser directly from res.data (not res.data.user)
    set({ authUser: res.data });

    get().connectSocket();
  } catch (error) {
    console.log("Error in checkAuth:", error);
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
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

      // ✅ Validate token before saving
      if (res.data.token && res.data.token !== "null") {
        localStorage.setItem("token", res.data.token);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${res.data.token}`;
      }

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
    const loginUrl = `${VITE_API_BASE_URL}/api/auth/login`;
    console.log("Attempting login to:", loginUrl);
    console.log("VITE_API_BASE_URL:", VITE_API_BASE_URL);

    const res = await axios.post(loginUrl, data);

    if (res.data && res.data.token && res.data.token !== "null") {
      localStorage.setItem("token", res.data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
    }

    // Disconnect previous socket if exists
    const prevSocket = get().socket;
    if (prevSocket) prevSocket.disconnect();

    // Fix here: set authUser directly from res.data (not res.data.user)
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
      await axios.post(`${VITE_API_BASE_URL}/api/auth/logout`);
    } catch (error) {
      // ✅ Don't show error toast for logout - might be expected if token is invalid
      console.log("Logout error:", error);
    } finally {
      // ✅ Always clear token and headers on logout
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      
      get().disconnectSocket();
      set({ authUser: null, onlineUsers: [] });
      toast.success("Logged out successfully");
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