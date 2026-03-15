import express from "express";
const router = express.Router();
import {protectRoute } from "../middleware/protectRoute.js";
import { 
  getUsersForSidebar, 
  getMessages, 
  sendMessage,
  searchUserByEmail,
  addContact,
  removeContact,
  getUserContacts,
  markMessageAsDelivered,
  markMessagesAsRead
} from "../controllers/message.controller.js"

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/contacts", protectRoute, getUserContacts);
router.get("/search", protectRoute, searchUserByEmail);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);
router.post("/contacts/:contactId", protectRoute, addContact);
router.post("/delivered/:messageId", protectRoute, markMessageAsDelivered);
router.post("/read/:senderId", protectRoute, markMessagesAsRead);

router.delete("/contacts/:contactId", protectRoute, removeContact);

export default router;