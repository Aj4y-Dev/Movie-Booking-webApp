import express from "express";
import authController from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refreshAccessToken);
router.post("/logout", authController.logout);
router.get("/me", protect, authController.getme);

export default router;
