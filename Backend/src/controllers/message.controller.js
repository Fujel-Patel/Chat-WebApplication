import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js"; // Ensure `io` is exported from socket.js
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

// Helper function for consistent error responses
const sendErrorResponse = (res, statusCode, message, errorDetails) => {
  console.error(`Error: ${message}`, errorDetails);
  res.status(statusCode).json({ message });
};

export const getUsersForSideBar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // 1. Validate loggedInUserId
    if (!loggedInUserId) {
      return sendErrorResponse(res, 401, "Unauthorized: User ID not found.");
    }

    // 2. Select only necessary fields for sidebar users (e.g., fullName, profilePic, _id)
    // Exclude password is good, but explicitly selecting fields is often better.
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select(
      "fullName profilePic email"
    );

    res.status(200).json(filteredUsers);
  } catch (error) { // Use 'error' for consistency
    sendErrorResponse(res, 500, "Internal Server Error fetching users.", error);
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // 1. Input Validation
    if (!myId || !userToChatId) {
      return sendErrorResponse(res, 400, "Sender or receiver ID is missing.");
    }

    // 2. Optimized Query with Sorting and Potential Caching
    // Using $or is fine, but for two specific exact matches like this,
    // a more structured query can sometimes be optimized by MongoDB itself
    // if a compound index is present on (senderId, receiverId).
    // Ensure you have a compound index: { senderId: 1, receiverId: 1, createdAt: 1 }
    // or { receiverId: 1, senderId: 1, createdAt: 1 } for better performance.
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 }); // Always sort messages to ensure chronological order

    // 3. Populate sender/receiver info if needed on the client-side
    // If your frontend needs user details for sender/receiver, consider `.populate()`.
    // Example: .populate("senderId", "fullName profilePic").populate("receiverId", "fullName profilePic")

    res.status(200).json(messages);
  } catch (error) {
    sendErrorResponse(res, 500, "Internal Server Error fetching messages.", error);
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // 1. Input Validation
    if (!senderId || !receiverId) {
      return sendErrorResponse(res, 400, "Sender or receiver ID is missing.");
    }
    if (!text && !image) { // Message must have content
      return sendErrorResponse(res, 400, "Message cannot be empty.");
    }

    let imageUrl = null; // Initialize to null

    // 2. Cloudinary Upload with Error Handling
    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: "chat_messages", // Use a specific folder for messages
          // Optional: Add `resource_type: "auto"` if you expect videos/other media
        });
        imageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        sendErrorResponse(res, 500, "Failed to upload image.", uploadError);
        return; // Exit if image upload fails
      }
    }

    // 3. Create New Message
    const newMessage = new Message({
      senderId,
      receiverId,
      text: text || null, // Store null if text is empty, consistent data
      image: imageUrl,
    });

    // 4. Save Message to Database
    await newMessage.save();

    // 5. Real-time Communication (Socket.IO)
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    sendErrorResponse(res, 500, "Internal Server Error sending message.", error);
  }
};