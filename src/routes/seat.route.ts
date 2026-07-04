import express from "express";
import seatController from "../controllers/seat.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /seats/{showId}:
 *   get:
 *     summary: Get all seats for a show
 *     tags: [Seats]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: showId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Seat map with states
 */
router.get("/seats/:showId", seatController.getShowSeats);

/**
 * @swagger
 * /seats/lock:
 *   post:
 *     summary: Lock seats for 5 minutes before payment
 *     tags: [Seats]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [seatIds, showId]
 *             properties:
 *               seatIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64abc123...", "64abc124..."]
 *               showId:
 *                 type: string
 *                 example: 64abc125...
 *     responses:
 *       200:
 *         description: Seats locked successfully
 *       409:
 *         description: One or more seats already taken
 */
router.post(
  "/seats/lock",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  seatController.lockSeats,
);

/**
 * @swagger
 * /seats/release:
 *   post:
 *     summary: Release seat locks
 *     tags: [Seats]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [seatIds, showId]
 *             properties:
 *               seatIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               showId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Seats released
 */
router.post(
  "/seats/release",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  seatController.releaseLock,
);

export default router;
