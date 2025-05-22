import express from "express";
const router = express.Router();
import signup from "../controllers/auth/signupController.js";
import login from "../controllers/auth/loginController.js";
import logout from "../controllers/auth/logoutController.js";
import updateProfile from "../controllers/auth/updateprofileController.js";
import checkAuth from "../controllers/auth/checkAuthController.js";
import protectRoute from "../middleware/protectRoute.js";

router.get('/check', protectRoute, checkAuth);
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

router.put('/updateProfile', protectRoute, updateProfile);

export default router;