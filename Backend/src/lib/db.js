import mongoose from "mongoose";
dotenv.config();

export const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
}