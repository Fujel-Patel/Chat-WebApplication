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
    console.error("Error in getUsersForSideBar:", err.message);
    res.status(500).json({ message: "Internal Server Error while fetching users." });
  }
};

// ✅ Get messages between current user and another user
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error("Error in getMessages:", err.message);
    res.status(500).json({ message: "Internal Server Error while fetching messages." });
  }
};

// ✅ Send a new message (optionally with image)
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "Message content cannot be empty." });
    }

    let imageUrl = null;
    if (image) {
      try {
        const uploaded = await cloudinary.uploader.upload(image, {
          folder: "chat_app_messages",
        });
        imageUrl = uploaded.secure_url;
      } catch (uploadErr) {
        console.error("Cloudinary upload failed:", uploadErr.message);
        return res.status(500).json({ message: "Image upload failed." });
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text: text || null,
      image: imageUrl || null,
    });

    await newMessage.save();

    // Emit message to receiver if online
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
      console.log(`Emitted newMessage to socket ${receiverSocketId}`);
    }

    res.status(201).json(newMessage);
  } catch (err) {
    console.error("Error in sendMessage:", err.message);
    res.status(500).json({ message: "Internal Server Error while sending message." });
  }
};