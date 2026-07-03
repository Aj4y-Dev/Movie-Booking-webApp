import asyncHandler from "../utils/asyncHandler.js";
import { Request, Response } from "express";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";
import Booking from "../models/booking.model.js";

class BookingController {
  getSpecififcBooking = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new AppError("Invalid id format", 400);

    const user = await Booking.findById(id);
    if (!user) throw new AppError("Booking not found", 4000);

    res.status(200).json({ success: true, user });
  });
}

export default new BookingController();
