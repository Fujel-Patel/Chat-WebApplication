import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

// ✅ Get users for sidebar (excluding current user)
export const getUsersForSideBar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const users = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    res.status(200).json(users);
  } catch (err) {
    console.error("Error in getUsersForSideBar controller:", err.message);
    res.status(500).json({ message: "Internal Server Error during user fetching." });
  }
};

// ✅ Get messages between current user and selected user
export const getMessages = async (req, res) => {
  try {
    const userToChatId = req.params.id;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error("Error in getMessages controller:", err.message);
    res.status(500).json({ message: "Internal Server Error during message fetching." });
  }
};

// ✅ Send a new message (with optional image upload)
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "Message cannot be empty." });
    }

    let imageUrl = null;
    if (image) {
      try {
        const uploaded = await cloudinary.uploader.upload(image, {
          folder: "chat_app_messages",
        });
        imageUrl = uploaded.secure_url;
      } catch (err) {
        console.error("Cloudinary upload failed:", err.message);
        return res.status(500).json({ message: "Failed to upload image." });
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text: text || null,
      image: imageUrl || null,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
      console.log(`Emitted newMessage to socket ${receiverSocketId}`);
    }

    res.status(201).json(newMessage);
  } catch (err) {
    console.error("Error in sendMessage controller:", err.message);
    res.status(500).json({ message: "Internal Server Error during message sending." });
  }
};