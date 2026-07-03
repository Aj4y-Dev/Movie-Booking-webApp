import express from "express";
import paymentController from "../controllers/payment.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// initiate payment: authenticated users only
router.post(
  "/payment/initiate",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  paymentController.initiatePayment,
);

// eSewa callbacks: no auth, eSewa calls these directly
router.get("/payment/esewa/success", paymentController.esewaSuccess);
router.get("/payment/esewa/failure", paymentController.esewaFailure);

// get payment status
router.get(
  "/payment/status/:bookingId",
  protect,
  authorizeRoles("USER", "SYSTEM_ADMIN", "ROOT_ADMIN"),
  paymentController.getPaymentStatus,
);

export default router;
