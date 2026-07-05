import express from "express";
import bookingController from "../controllers/booking.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";
import { bookingLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

/**
 * @swagger
 * /booking:
 *   post:
 *     summary: Create a booking after seats are locked
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [show, seats]
 *             properties:
 *               show:
 *                 type: string
 *                 example: 64abc125...
 *               seats:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64abc123...", "64abc124..."]
 *     responses:
 *       201:
 *         description: Booking created — proceed to payment
 *       409:
 *         description: Seats not locked or lock expired
 */
router.post(
  "/booking",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  bookingLimiter,
  bookingController.createBooking,
);

/**
 * @swagger
 * /bookings/my:
 *   get:
 *     summary: Get my bookings
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: List of my bookings
 */
router.get(
  "/bookings/my",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  bookingController.getMyBookings,
);

/**
 * @swagger
 * /booking/{id}:
 *   get:
 *     summary: Get specific booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking details
 *       403:
 *         description: Unauthorized
 */
router.get(
  "/booking/:id",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  bookingController.getBooking,
);

/**
 * @swagger
 * /booking/{id}/cancel:
 *   patch:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking cancelled
 */
router.patch(
  "/booking/:id/cancel",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  bookingController.cancelBooking,
);

export default router;
