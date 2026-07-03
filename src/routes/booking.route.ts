import express from "express";
import bookingController from "../controllers/booking.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/book/:id",
  protect,
  authorizeRoles("CLIENT", "USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  bookingController.getSpecififcBooking,
);

export default router;
