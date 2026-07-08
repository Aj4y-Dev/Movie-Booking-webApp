import { Request, Response } from "express";
import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import Payment from "../models/payment.model.js";
import Booking from "../models/booking.model.js";
import Seat from "../models/seat.model.js";
import Show from "../models/show.model.js";
import { emitSeatBooked } from "../socket/index.js";
import {
  getEsewaPaymentHash,
  verifyEsewaPayment,
  verifyEsewaPaymentFailure,
  ESEWA_PAYMENT_URL,
} from "../services/esewa.js";

class PaymentController {
  // initiate eSewa payment
  initiatePayment = asyncHandler(async (req: Request, res: Response) => {
    const { bookingId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(bookingId))
      throw new AppError("Invalid booking id", 400);

    const booking = await Booking.findById(bookingId);

    if (!booking) throw new AppError("Booking not found", 404);

    if (booking.user.toString() !== req.user?.id)
      throw new AppError("Unauthorized", 403);

    if (booking.status !== "PENDING")
      throw new AppError("Booking is not in pending state", 400);

    if (booking.paymentStatus === "PAID")
      throw new AppError("Booking is already paid", 400);

    // check if pending payment already exists to avoid duplicate
    const existingPayment = await Payment.findOne({
      booking: bookingId,
      status: "PENDING",
    });

    if (existingPayment) {
      const paymentHash = getEsewaPaymentHash({
        amount: booking.totalAmount,
        transaction_uuid: existingPayment.transactionId,
      });
      return res.status(200).json({
        success: true,
        paymentHash,
        esewaUrl: ESEWA_PAYMENT_URL,
      });
    }

    // generate unique transaction id
    const transaction_uuid = `${bookingId}-${Date.now()}`;

    const paymentHash = getEsewaPaymentHash({
      amount: booking.totalAmount,
      transaction_uuid,
    });

    // create pending payment record
    await Payment.create({
      booking: bookingId,
      user: req.user?.id,
      amount: booking.totalAmount,
      status: "PENDING",
      transactionId: transaction_uuid,
    });

    // store transactionId in booking
    booking.paymentId = transaction_uuid;
    await booking.save();

    res.status(200).json({
      success: true,
      paymentHash,
      esewaUrl: ESEWA_PAYMENT_URL,
    });
  });

  //eSewa redirects here on success
  esewaSuccess = asyncHandler(async (req: Request, res: Response) => {
    const { data } = req.query as { data: string };

    if (!data) throw new AppError("No payment data received", 400);

    const { decodedData } = await verifyEsewaPayment(data);
    const { transaction_uuid } = decodedData;

    const payment = await Payment.findOne({ transactionId: transaction_uuid });
    if (!payment) throw new AppError("Payment record not found", 404);

    // idempotency: already processed
    if (payment.status === "SUCCESS") {
      return res.status(200).json({
        success: true,
        message: "Payment already processed",
        bookingId: payment.booking,
      });
    }

    const booking = await Booking.findById(payment.booking);

    if (!booking) throw new AppError("Booking not found", 404);

    // atomic transaction: all or nothing
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // update payment to success
      payment.status = "SUCCESS";
      payment.paymentDate = new Date();
      await payment.save({ session });

      // confirm booking
      booking.status = "CONFIRMED";
      booking.paymentStatus = "PAID";
      await booking.save({ session });

      // mark seats as booked
      await Seat.updateMany(
        { _id: { $in: booking.seats } },
        {
          isBooked: true,
          bookedBy: booking.user,
          isLocked: false,
          lockedBy: null,
          lockedAt: null,
          lockExpiresAt: null,
        },
        { session },
      );

      // decrease available seats in show
      await Show.findByIdAndUpdate(
        booking.show,
        { $inc: { availableSeats: -booking.seats.length } },
        { session },
      );

      await session.commitTransaction();

      // notify all users in show room via socket
      emitSeatBooked(
        booking.show.toString(),
        booking.seats.map((s) => s.toString()),
      );

      res.status(200).json({
        success: true,
        message: "Payment successful and booking confirmed",
        bookingId: booking._id,
      });
    } catch (error) {
      await session.abortTransaction();
      throw new AppError("Payment processing failed", 500);
    } finally {
      session.endSession();
    }
  });

  //eSewa redirects here on failure
  esewaFailure = asyncHandler(async (req: Request, res: Response) => {
    const { data } = req.query as { data: string };

    if (data) {
      try {
        const { decodedData } = verifyEsewaPaymentFailure(data);
        const { transaction_uuid } = decodedData;

        const payment = await Payment.findOne({
          transactionId: transaction_uuid,
        });
        if (payment && payment.status === "PENDING") {
          payment.status = "FAILED";
          await payment.save();

          await Booking.findByIdAndUpdate(payment.booking, {
            paymentStatus: "FAILED",
          });
        }
      } catch (err) {
        console.error("eSewa failure callback error:", err);
      }
    }

    res.status(200).json({
      success: false,
      message: "Payment failed",
    });
  });

  // get payment status by booking id
  getPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
    const { bookingId } = req.params as { bookingId: string };

    if (!mongoose.Types.ObjectId.isValid(bookingId))
      throw new AppError("Invalid booking id", 400);

    const [payment, booking] = await Promise.all([
      Payment.findOne({ booking: bookingId }),
      Booking.findById(bookingId),
    ]);

    if (!payment) throw new AppError("Payment not found", 404);
    if (!booking) throw new AppError("Booking not found", 404);

    if (
      booking.user.toString() !== req.user?.id &&
      req.user?.role !== "SYSTEM_ADMIN" &&
      req.user?.role !== "ROOT_ADMIN"
    ) {
      throw new AppError("Unauthorized", 403);
    }

    res.status(200).json({ success: true, payment });
  });
}

export default new PaymentController();
