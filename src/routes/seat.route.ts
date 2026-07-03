import express from "express";
import seatController from "../controllers/seat.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// public anyone can view seat map for a show
router.get("/seats/:showId", seatController.getShowSeats);

// only USER and above can lock/release seats
router.post(
  "/seats/lock",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  seatController.lockSeats,
);

router.post(
  "/seats/release",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  seatController.releaseLock,
);

export default router;
