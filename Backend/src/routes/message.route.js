import express from "express";
const router = express.Router();
import  protectRoute  from "../middleware/protectRoute.js";
import {getUsersForSideBar, getMessages, sendMessage} from "../controllers/message.controller.js"

router.get("/users", protectRoute, getUsersForSideBar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);
export default router;