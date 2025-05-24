// src/lib/axios.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.MODE === "development"
  ? "http://localhost:5000/api"
  : "https://chat-webapplication-yf2z.onrender.com/api";

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // <--- THIS MUST BE TRUE
  headers: {
    'Content-Type': 'application/json',
  },
});