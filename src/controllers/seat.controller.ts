import { Request, Response } from "express";
import mongoose from "mongoose";
import { emitSeatLocked, emitSeatReleased } from "../socket/index.js";
import Seat from "../models/seat.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

class SeatController {
  // lock seats of user selects seats before payment
  lockSeats = asyncHandler(async (req: Request, res: Response) => {
    const { seatIds, showId } = req.body;

    if (!seatIds?.length || !showId)
      throw new AppError("seatIds and showId are required", 400);

    if (!mongoose.Types.ObjectId.isValid(showId))
      throw new AppError("Invalid show id", 400);

    if (!seatIds.every((id: string) => mongoose.Types.ObjectId.isValid(id)))
      throw new AppError("Invalid seat id format", 400);

    const now = new Date();
    const lockExpiresAt = new Date(now.getTime() + LOCK_DURATION_MS);

    // find seats that are available not booked and not locked (or lock expired)
    const availableSeats = await Seat.find({
      _id: { $in: seatIds },
      show: showId,
      isBooked: false,
      $or: [
        { isLocked: false },
        { lockExpiresAt: { $lt: now } }, // expired lock = available
      ],
    });

    // check all requested seats are available
    if (availableSeats.length !== seatIds.length)
      throw new AppError("One or more seats are already taken", 409);

    // lock all seats atomically
    await Seat.updateMany(
      { _id: { $in: seatIds } },
      {
        isLocked: true,
        lockedBy: req.user?.id,
        lockedAt: now,
        lockExpiresAt,
      },
    );

    // emit to all users in this show room seats are now locked
    emitSeatLocked(showId, seatIds, req.user!.id, lockExpiresAt);

    res.status(200).json({
      success: true,
      message: "Seats locked successfully",
      lockExpiresAt,
    });
  });

  // release lock user changes mind before payment
  releaseLock = asyncHandler(async (req: Request, res: Response) => {
    const { seatIds, showId } = req.body;

    if (!seatIds?.length || !showId)
      throw new AppError("seatIds and showId are required", 400);

    if (!mongoose.Types.ObjectId.isValid(showId))
      throw new AppError("Invalid show id", 400);

    // only release seats locked by this user
    await Seat.updateMany(
      { _id: { $in: seatIds }, lockedBy: req.user?.id },
      {
        isLocked: false,
        lockedBy: null,
        lockedAt: null,
        lockExpiresAt: null,
      },
    );

    // emit to all users that seats are now available
    emitSeatReleased(showId, seatIds);

    res.status(200).json({ success: true, message: "Seats released" });
  });

  // get seats for a show (with realtime state)
  getShowSeats = asyncHandler(async (req: Request, res: Response) => {
    const { showId } = req.params as { showId: string };

    if (!mongoose.Types.ObjectId.isValid(showId))
      throw new AppError("Invalid show id", 400);

    const now = new Date();

    const seats = await Seat.find({ show: showId })
      .select(
        "seatNumber row type price isBooked isLocked lockedBy lockExpiresAt",
      )
      .sort({ row: 1, seatNumber: 1 });

    // treat expired locks as available in response
    const seatsWithState = seats.map((seat) => {
      const isExpired = seat.lockExpiresAt && seat.lockExpiresAt < now;
      return {
        _id: seat._id,
        seatNumber: seat.seatNumber,
        row: seat.row,
        type: seat.type,
        price: seat.price,
        isBooked: seat.isBooked,
        isLocked: seat.isLocked && !isExpired,
        // if locked by current user show as "my lock"
        isLockedByMe: seat.lockedBy?.toString() === req.user?.id,
        lockExpiresAt: isExpired ? null : seat.lockExpiresAt,
        // seat state for frontend
        state: seat.isBooked
          ? "BOOKED"
          : seat.isLocked && !isExpired
            ? seat.lockedBy?.toString() === req.user?.id
              ? "MY_LOCK"
              : "LOCKED"
            : "AVAILABLE",
      };
    });

    res.status(200).json({ success: true, seats: seatsWithState });
  });
}

export default new SeatController();
