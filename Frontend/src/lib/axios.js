import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to every request if exists
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;


// import axios from 'axios';

// // Create an axios instance with predefined configuration
// const axiosInstance = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL,
//   withCredentials: true, // Enables sending cookies in cross-origin requests
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });
// export default axiosInstance;