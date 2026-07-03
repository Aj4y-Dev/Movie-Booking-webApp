import express from "express";
import bookingController from "../controllers/booking.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/booking",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  bookingController.createBooking,
);

router.get(
  "/bookings/my",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  bookingController.getMyBookings,
);

router.get(
  "/booking/:id",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  bookingController.getBooking,
);

router.patch(
  "/booking/:id/cancel",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  bookingController.cancelBooking,
);

export default router;
