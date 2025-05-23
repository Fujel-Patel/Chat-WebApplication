import cloudinary from "../lib/cloudinary.js";

import { getReceiverSocketId } from "../lib/socket.js";

import Message from "../models/message.model.js";

import User from "../models/user.model.js";

export const getUsersForSideBar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUser = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUser);
  } catch (err) {
    console.log("error in getUserFoSideBar");

    res.status(400).json({ message: "Internal server Error" + err });
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
  } catch (err) {
    console.log("error in getMessaage");

    res.status(400).json({ message: "Internal server Error" + err });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;

    const { id: receiverId } = req.params;

    const senderId = req.user._id;

    let imageUrl;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);

      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,

      receiverId,

      text,

      image: imageUrl,
    });

    await newMessage.save();

    const recieiverSocketId = getReceiverSocketId(receiverId);

    if (recieiverSocketId) {
      io.to(recieiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (err) {
    console.log("error in sendMessagecontroller");

    res.status(400).json({ message: "Internal server Error" + err });
  }
};
