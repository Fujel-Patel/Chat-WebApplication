import axios from 'axios';
import "dotenv/config"

// Create an axios instance with predefined configuration
const axiosInstance = axios.create({
  baseURL: process.env.BASE_URL,
  withCredentials: true, // Enables sending cookies in cross-origin requests
  headers: {
    'Content-Type': 'application/json',
  },
});
export default axiosInstance;