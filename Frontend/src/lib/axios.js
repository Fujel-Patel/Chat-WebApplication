import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "chat-web-application-eqt3.vercel.app",
  withCredentials: true,
});