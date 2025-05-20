import mongoose from "mongoose";
import 'dotenv/config';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected"); // Add a success log
  } catch (error) {
    console.error("MongoDB connection error:", error); // Log the specific error
    throw error; // Re-throw the error to be caught in index.js
  }
};

// import mongoose from "mongoose";
// import 'dotenv/config';

// export const connectDB = async () => {
//     await mongoose.connect(process.env.MONGODB_URI);
// }