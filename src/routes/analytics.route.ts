import express from "express";
import analyticsController from "../controllers/analytics.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Theatre owner analytics and revenue tracking
 */

/**
 * @swagger
 * /analytics/owner:
 *   get:
 *     summary: Get full analytics for theatre owner
 *     description: Returns complete analytics dashboard including total revenue, bookings, monthly trends, seat type breakdown, payment summary and top performing shows. Only accessible by theatre owners (CLIENT), SYSTEM_ADMIN and ROOT_ADMIN.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 analytics:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       description: High level summary across all owned theatres
 *                       properties:
 *                         totalRevenue:
 *                           type: number
 *                           example: 1360
 *                         totalBookings:
 *                           type: number
 *                           example: 2
 *                         totalTheatres:
 *                           type: number
 *                           example: 1
 *                     revenuePerTheatre:
 *                       type: array
 *                       description: Revenue breakdown per theatre
 *                       items:
 *                         type: object
 *                         properties:
 *                           theatreId:
 *                             type: string
 *                             example: 6a4bbac48b34e6045075a24c
 *                           theatreName:
 *                             type: string
 *                             example: QFX Civil Mall
 *                           city:
 *                             type: string
 *                             example: Kathmandu
 *                           revenue:
 *                             type: number
 *                             example: 1360
 *                           bookings:
 *                             type: number
 *                             example: 2
 *                           totalSeatsBooked:
 *                             type: number
 *                             example: 4
 *                     revenuePerShow:
 *                       type: array
 *                       description: Revenue and occupancy breakdown per show
 *                       items:
 *                         type: object
 *                         properties:
 *                           showId:
 *                             type: string
 *                             example: 6a4c9620195d6607123c6f1c
 *                           movieName:
 *                             type: string
 *                             example: Jawan
 *                           showTime:
 *                             type: string
 *                             format: date-time
 *                             example: "2026-12-25T14:00:00.000Z"
 *                           revenue:
 *                             type: number
 *                             example: 1360
 *                           bookings:
 *                             type: number
 *                             example: 2
 *                           totalSeatsBooked:
 *                             type: number
 *                             example: 4
 *                           totalSeats:
 *                             type: number
 *                             example: 50
 *                           availableSeats:
 *                             type: number
 *                             example: 46
 *                           occupancyRate:
 *                             type: number
 *                             description: Percentage of seats filled
 *                             example: 8
 *                     monthlyRevenue:
 *                       type: array
 *                       description: Revenue trend for last 12 months
 *                       items:
 *                         type: object
 *                         properties:
 *                           year:
 *                             type: number
 *                             example: 2026
 *                           month:
 *                             type: number
 *                             example: 7
 *                           revenue:
 *                             type: number
 *                             example: 1360
 *                           bookings:
 *                             type: number
 *                             example: 2
 *                     seatTypeRevenue:
 *                       type: array
 *                       description: Revenue breakdown by seat type
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             enum: [STANDARD, PREMIUM, VIP]
 *                             example: STANDARD
 *                           revenue:
 *                             type: number
 *                             example: 610
 *                           count:
 *                             type: number
 *                             example: 2
 *                     paymentSummary:
 *                       type: array
 *                       description: Payment status breakdown
 *                       items:
 *                         type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                             enum: [PENDING, SUCCESS, FAILED, REFUNDED]
 *                             example: SUCCESS
 *                           count:
 *                             type: number
 *                             example: 2
 *                           totalAmount:
 *                             type: number
 *                             example: 1360
 *                     topShows:
 *                       type: array
 *                       description: Top 5 highest earning shows
 *                       items:
 *                         type: object
 *                         properties:
 *                           movieName:
 *                             type: string
 *                             example: Jawan
 *                           theatreName:
 *                             type: string
 *                             example: QFX Civil Mall
 *                           showTime:
 *                             type: string
 *                             format: date-time
 *                             example: "2026-12-25T14:00:00.000Z"
 *                           revenue:
 *                             type: number
 *                             example: 1360
 *                           bookings:
 *                             type: number
 *                             example: 2
 *                           occupancyRate:
 *                             type: number
 *                             example: 8
 *       401:
 *         description: Unauthorized — access token required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Access token required
 *       403:
 *         description: Forbidden — only CLIENT, SYSTEM_ADMIN, ROOT_ADMIN allowed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: You do not have permission
 *       404:
 *         description: No theatres found for this owner
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: No theatres found for this owner
 */
router.get(
  "/analytics/owner",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  analyticsController.getOwnerAnalytics,
);

export default router;
