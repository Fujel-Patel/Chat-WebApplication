// src/api/axiosInstance.js
import axios from "axios";

const VITE_API_BASE_URL = "https://chat-webapplication-yf2z.onrender.com";

const axiosInstance = axios.create({
  baseURL: VITE_API_BASE_URL,
});

// Attach token to every request (if available)
const token = localStorage.getItem("token");
if (token && token !== "null" && token !== "undefined") {
  axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// Global error handling (e.g. token expiration)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      delete axiosInstance.defaults.headers.common["Authorization"];
      console.warn("Token expired or unauthorized. Cleared from storage.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;