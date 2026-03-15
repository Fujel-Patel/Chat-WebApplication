import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("_id fullName profilePic");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Auto-add users to each other's contacts if not already there
    const senderUser = await User.findById(senderId);
    const receiverUser = await User.findById(receiverId);

    if (!senderUser.contacts.includes(receiverId)) {
      await User.findByIdAndUpdate(senderId, { $push: { contacts: receiverId } });
    }
    if (!receiverUser.contacts.includes(senderId)) {
      await User.findByIdAndUpdate(receiverId, { $push: { contacts: senderId } });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      // If receiver is online, auto-mark as delivered
      newMessage.status = "delivered";
      newMessage.deliveredAt = new Date();
      await newMessage.save();
      
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Search user by email
export const searchUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    const loggedInUserId = req.user._id;

    if (!email || email.trim() === "") {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("_id fullName profilePic email");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user._id.toString() === loggedInUserId.toString()) {
      return res.status(400).json({ error: "Cannot add yourself" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in searchUserByEmail: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add user to contacts (bidirectional)
export const addContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const loggedInUserId = req.user._id;

    if (contactId === loggedInUserId.toString()) {
      return res.status(400).json({ error: "Cannot add yourself" });
    }

    // Check if contact exists
    const contactUser = await User.findById(contactId);
    if (!contactUser) {
      return res.status(404).json({ error: "Contact user not found" });
    }

    // Check if already in contacts (bidirectional)
    const currentUser = await User.findById(loggedInUserId);
    if (currentUser.contacts.includes(contactId)) {
      return res.status(400).json({ error: "User already in contacts" });
    }

    // Add to contacts BIDIRECTIONALLY
    // Add contactId to loggedInUser's contacts
    await User.findByIdAndUpdate(loggedInUserId, { $push: { contacts: contactId } }, { new: true });
    
    // Add loggedInUserId to contact's contacts (bidirectional)
    await User.findByIdAndUpdate(contactId, { $push: { contacts: loggedInUserId } }, { new: true });

    res.status(200).json({ message: "Contact added successfully" });
  } catch (error) {
    console.error("Error in addContact: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Remove user from contacts
export const removeContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const loggedInUserId = req.user._id;

    await User.findByIdAndUpdate(loggedInUserId, { $pull: { contacts: contactId } }, { new: true });

    res.status(200).json({ message: "Contact removed successfully" });
  } catch (error) {
    console.error("Error in removeContact: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get user contacts
export const getUserContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const user = await User.findById(loggedInUserId).populate("contacts", "_id fullName profilePic email");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.contacts);
  } catch (error) {
    console.error("Error in getUserContacts: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark message as delivered
export const markMessageAsDelivered = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Only receiver can mark as delivered
    if (message.receiverId.toString() !== userId.toString()) {
      return res.status(400).json({ error: "Unauthorized" });
    }

    // Update status and deliveredAt timestamp
    message.status = "delivered";
    message.deliveredAt = new Date();
    await message.save();

    // Emit event to sender
    const senderSocketId = getReceiverSocketId(message.senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageDelivered", {
        messageId,
        status: "delivered",
        deliveredAt: message.deliveredAt
      });
    }

    res.status(200).json(message);
  } catch (error) {
    console.error("Error in markMessageAsDelivered: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { senderId } = req.params;
    const receiverId = req.user._id;

    const messages = await Message.find({
      senderId,
      receiverId,
      status: { $ne: "read" }
    });

    if (messages.length === 0) {
      return res.status(200).json({ message: "No unread messages" });
    }

    const currentTime = new Date();
    await Message.updateMany(
      {
        senderId,
        receiverId,
        status: { $ne: "read" }
      },
      {
        $set: {
          status: "read",
          readAt: currentTime
        }
      }
    );

    // Emit event to sender
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", {
        senderId,
        receiverId,
        status: "read",
        readAt: currentTime
      });
    }

    res.status(200).json({ message: "Messages marked as read", count: messages.length });
  } catch (error) {
    console.error("Error in markMessagesAsRead: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};