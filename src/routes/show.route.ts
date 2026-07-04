import express from "express";
import showController from "../controllers/show.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /shows:
 *   get:
 *     summary: Get all active shows
 *     tags: [Shows]
 *     security: []
 *     responses:
 *       200:
 *         description: List of active shows
 */
router.get("/shows", showController.getAllShows);

/**
 * @swagger
 * /shows/movie/{movieId}:
 *   get:
 *     summary: Get shows by movie
 *     tags: [Shows]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shows for movie
 */
router.get("/shows/movie/:movieId", showController.getShowByMovie);

/**
 * @swagger
 * /shows/theatre/{theatreId}:
 *   get:
 *     summary: Get shows by theatre
 *     tags: [Shows]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: theatreId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shows for theatre
 */
router.get("/shows/theatre/:theatreId", showController.getShowByTheatre);

/**
 * @swagger
 * /show/{id}:
 *   get:
 *     summary: Get specific show with seat map
 *     tags: [Shows]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Show details with seats
 */
router.get("/show/:id", showController.getShow);

/**
 * @swagger
 * /shows/my-shows:
 *   get:
 *     summary: Get shows created by logged in user
 *     tags: [Shows]
 *     responses:
 *       200:
 *         description: My shows
 */
router.get(
  "/shows/my-shows",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  showController.getMyShows,
);

/**
 * @swagger
 * /show:
 *   post:
 *     summary: Create a show (CLIENT who owns theatre)
 *     tags: [Shows]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [movie, theatre, showTime, totalSeats]
 *             properties:
 *               movie:
 *                 type: string
 *                 example: 64abc123def456789012abcd
 *               theatre:
 *                 type: string
 *                 example: 64abc123def456789012abce
 *               showTime:
 *                 type: string
 *                 example: "2025-12-25T14:00:00.000Z"
 *               totalSeats:
 *                 type: number
 *                 example: 200
 *               standardPrice:
 *                 type: number
 *                 example: 300
 *               premiumPrice:
 *                 type: number
 *                 example: 500
 *               vipPrice:
 *                 type: number
 *                 example: 700
 *     responses:
 *       201:
 *         description: Show created with seats auto-generated
 */
router.post(
  "/show",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  showController.createShow,
);

/**
 * @swagger
 * /show/{id}:
 *   patch:
 *     summary: Update show time
 *     tags: [Shows]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               showTime:
 *                 type: string
 *                 example: "2025-12-26T16:00:00.000Z"
 *     responses:
 *       200:
 *         description: Show updated
 */
router.patch(
  "/show/:id",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  showController.updateShow,
);

/**
 * @swagger
 * /show/{id}/cancel:
 *   patch:
 *     summary: Cancel a show
 *     tags: [Shows]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Show cancelled
 */
router.patch(
  "/show/:id/cancel",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  showController.cancelShow,
);

/**
 * @swagger
 * /show/{id}:
 *   delete:
 *     summary: Delete show (only if no bookings)
 *     tags: [Shows]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Show deleted
 */
router.delete(
  "/show/:id",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  showController.deleteShow,
);

export default router;
