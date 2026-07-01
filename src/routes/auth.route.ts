import express from "express";
import authController from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "../validations/user.validation.js";

const router = express.Router();

router.post("/signup", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refreshAccessToken);
router.post("/logout", authController.logout);
router.get("/me", protect, authController.getme);

export default router;
