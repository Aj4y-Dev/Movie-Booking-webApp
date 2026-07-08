import express from "express";
import analyticsController from "../controllers/analytics.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/analytics/owner",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  analyticsController.getOwnerAnalytics,
);

export default router;
