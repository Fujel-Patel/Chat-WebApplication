import axios from 'axios';

// Create an axios instance with predefined configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Enables sending cookies in cross-origin requests
  headers: {
    'Content-Type': 'application/json',
  },
});
export default axiosInstance;