
import mongoose from "mongoose";
import 'dotenv/config';
import dns from "dns";

// Set custom DNS servers to avoid system DNS issues with SRV lookups
dns.setServers(['8.8.8.8', '1.1.1.1']);


export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri || typeof uri !== "string" || uri.trim() === "") {
    console.error("Critical: MONGODB_URI environment variable is missing or empty. Please check your .env file.");
    throw new Error("MONGODB_URI environment variable is missing or empty.");
  }
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

// import mongoose from "mongoose";
// import 'dotenv/config';

// export const connectDB = async () => {
//     await mongoose.connect(process.env.MONGODB_URI);
// }

