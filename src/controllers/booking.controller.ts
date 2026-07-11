import asyncHandler from "../utils/asyncHandler.js";
import { Request, Response } from "express";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";
import Seat from "../models/seat.model.js";
import Show from "../models/show.model.js";
import { emitSeatBooked } from "../socket/index.js";
import Booking from "../models/booking.model.js";

class BookingController {
  // create booking after seats are locked
  createBooking = asyncHandler(async (req: Request, res: Response) => {
    const { show, seats } = req.body;

    const now = new Date();

    // check show exists and is active
    const showExists = await Show.findById(show);
    if (!showExists) throw new AppError("Show not found", 404);
    if (showExists.status !== "ACTIVE")
      throw new AppError("Show is not available for booking", 400);

    // verify seats must be locked by this user and not expired
    const lockedSeats = await Seat.find({
      _id: { $in: seats },
      show,
      isBooked: false,
      isLocked: true,
      lockedBy: req.user?.id,
      lockExpiresAt: { $gt: now }, // lock must still be valid
    });

    if (lockedSeats.length !== seats.length)
      throw new AppError(
        "One or more seats are not locked by you or lock has expired",
        409,
      );

    // calculate total amount
    const totalAmount = lockedSeats.reduce((sum, seat) => sum + seat.price, 0);

    // create booking with PENDING status
    const booking = await Booking.create({
      user: req.user?.id,
      show,
      seats,
      totalAmount,
      status: "PENDING",
      paymentStatus: "PENDING",
      bookedAt: now,
    });

    res.status(201).json({
      success: true,
      booking,
      totalAmount,
      message: "Booking created — proceed to payment",
    });
  });

  //get my bookings
  getMyBookings = asyncHandler(async (req: Request, res: Response) => {
    const bookings = await Booking.find({ user: req.user?.id })
      .populate({
        path: "show",
        populate: [
          { path: "movie", select: "name trailerUrl" },
          { path: "theatre", select: "name city address" },
        ],
      })
      .populate("seats", "seatNumber row type price")
      .sort({ bookedAt: -1 });

    if (!bookings.length) throw new AppError("No bookings found", 404);

    res.status(200).json({ success: true, bookings });
  });

  // get specific booking
  getBooking = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id))
      throw new AppError("Invalid booking id", 400);

    const booking = await Booking.findById(id)
      .populate({
        path: "show",
        populate: [
          { path: "movie", select: "name trailerUrl releaseDate" },
          { path: "theatre", select: "name city address" },
        ],
      })
      .populate("seats", "seatNumber row type price")
      .populate("user", "name email");

    if (!booking) throw new AppError("Booking not found", 404);

    // only booking owner or admin can view
    if (
      booking.user._id.toString() !== req.user?.id &&
      req.user?.role !== "SYSTEM_ADMIN" &&
      req.user?.role !== "ROOT_ADMIN"
    ) {
      throw new AppError("You can only view your own bookings", 403);
    }

    res.status(200).json({ success: true, booking });
  });

  // cancel booking
  cancelBooking = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id))
      throw new AppError("Invalid booking id", 400);

    const booking = await Booking.findById(id);
    if (!booking) throw new AppError("Booking not found", 404);

    // only booking owner or admin can cancel
    if (
      booking.user.toString() !== req.user?.id &&
      req.user?.role !== "SYSTEM_ADMIN" &&
      req.user?.role !== "ROOT_ADMIN"
    ) {
      throw new AppError("You can only cancel your own bookings", 403);
    }

    if (booking.status === "CANCELLED")
      throw new AppError("Booking is already cancelled", 400);

    if (booking.status === "REFUNDED")
      throw new AppError("Booking is already refunded", 400);

    // release seats back
    await Seat.updateMany(
      { _id: { $in: booking.seats } },
      {
        isBooked: false,
        bookedBy: null,
        isLocked: false,
        lockedBy: null,
        lockedAt: null,
        lockExpiresAt: null,
      },
    );

    // update show available seats
    await Show.findByIdAndUpdate(booking.show, {
      $inc: { availableSeats: booking.seats.length },
    });

    // update booking status
    booking.status = "CANCELLED";
    booking.cancelledAt = new Date();

    // if already paid — mark for refund
    if (booking.paymentStatus === "PAID") {
      booking.paymentStatus = "REFUNDED";
      booking.status = "REFUNDED";
      // TODO: trigger eSewa
      //
      //  refund API
    }

    await booking.save();

    // emit seats released
    emitSeatBooked(
      booking.show.toString(),
      booking.seats.map((s) => s.toString()),
    );

    res.status(200).json({
      success: true,
      message:
        booking.status === "REFUNDED"
          ? "Booking cancelled and refund initiated"
          : "Booking cancelled successfully",
    });
  });
}

export default new BookingController();
