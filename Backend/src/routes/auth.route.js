import express from "express";
const router = express.Router();

import {
  signup,
  login,
  logout,
  updateProfile,
  checkAuth,
} from "../controllers/auth.controller.js";

import {protectRoute} from "../middleware/protectRoute.js";

// ✅ Auth Routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// ✅ Authenticated Routes
router.get("/check", protectRoute, checkAuth);
router.put("/update-profile", protectRoute, updateProfile);

export default router;
