import express from "express";
import paymentController from "../controllers/payment.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /payment/initiate:
 *   post:
 *     summary: Initiate eSewa payment
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bookingId]
 *             properties:
 *               bookingId:
 *                 type: string
 *                 example: 64abc126...
 *     responses:
 *       200:
 *         description: Returns paymentHash and esewaUrl
 */
router.post(
  "/payment/initiate",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  paymentController.initiatePayment,
);

/**
 * @swagger
 * /payment/esewa/success:
 *   get:
 *     summary: eSewa success callback (called by eSewa)
 *     tags: [Payment]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: data
 *         required: true
 *         schema:
 *           type: string
 *         description: Base64 encoded payment data from eSewa
 *     responses:
 *       200:
 *         description: Payment confirmed and booking completed
 */
router.get("/payment/esewa/success", paymentController.esewaSuccess);

/**
 * @swagger
 * /payment/esewa/failure:
 *   get:
 *     summary: eSewa failure callback (called by eSewa)
 *     tags: [Payment]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: data
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment failed
 */
router.get("/payment/esewa/failure", paymentController.esewaFailure);

/**
 * @swagger
 * /payment/status/{bookingId}:
 *   get:
 *     summary: Get payment status by booking id
 *     tags: [Payment]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment status
 */
router.get(
  "/payment/status/:bookingId",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  paymentController.getPaymentStatus,
);

export default router;
