import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import Movie from "../models/movie.model.js";
import Theatre from "../models/theatre.model.js";
import Show from "../models/show.model.js";
import Seat from "../models/seat.model.js";
import { generateSeats } from "../utils/generateSeats.js";
import mongoose from "mongoose";

const canManageShow = (
  theatre: any,
  user?: { id: string; role: string },
): boolean => {
  if (!user) return false;
  if (!theatre?.owner) return false;
  const isOwner = theatre.owner.toString() === user.id;
  const isAdmin = user.role === "SYSTEM_ADMIN" || user.role === "ROOT_ADMIN";
  return isOwner || isAdmin;
};

class ShowController {
  //Create show
  createShow = asyncHandler(async (req: Request, res: Response) => {
    const {
      movie,
      theatre,
      showTime,
      totalSeats,
      standardPrice,
      premiumPrice,
      vipPrice,
    } = req.body;

    if (!movie || !theatre || !showTime || !totalSeats)
      throw new AppError("All fields are required", 400);

    // validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(movie))
      throw new AppError("Invalid movie id format", 400);
    if (!mongoose.Types.ObjectId.isValid(theatre))
      throw new AppError("Invalid theatre id format", 400);

    // totalSeats must be a valid number
    const seatsCount = Number(totalSeats);
    if (!seatsCount || seatsCount < 1 || seatsCount > 200)
      throw new AppError("Total seats must be between 1 and 200", 400);

    // check movie exists
    const movieExists = await Movie.findById(movie);
    if (!movieExists) throw new AppError("Movie not found", 404);

    // check theatre exists
    const theatreExists = await Theatre.findById(theatre);
    if (!theatreExists) throw new AppError("Theatre not found", 404);

    // check ownership — CLIENT must own the theatre
    if (!canManageShow(theatreExists, req.user)) {
      throw new AppError("You can only create shows for your own theatre", 403);
    }

    // check duplicate show
    const existingShow = await Show.findOne({ movie, theatre, showTime });
    if (existingShow) {
      throw new AppError("Show already exists for this time", 409);
    }

    // create show
    const show = await Show.create({
      movie,
      theatre,
      showTime,
      totalSeats: seatsCount,
      availableSeats: seatsCount,
      standardPrice: standardPrice || 300,
      premiumPrice: premiumPrice || 500,
      vipPrice: vipPrice || 700,
      createdBy: req.user?.id,
      status: "ACTIVE",
    });

    // auto generate seats based on totalSeats
    try {
      await generateSeats(show._id.toString(), seatsCount, {
        standardPrice: show.standardPrice,
        premiumPrice: show.premiumPrice,
        vipPrice: show.vipPrice,
      });
    } catch (error) {
      // rollback if seat generation fails, delete the show
      await Show.findByIdAndDelete(show._id);
      throw new AppError("Failed to generate seats for show", 500);
    }

    res.status(201).json({ success: true, show });
  });

  // get all active shows
  getAllShows = asyncHandler(async (req: Request, res: Response) => {
    const shows = await Show.find({ status: "ACTIVE" })
      .populate("movie", "name language releaseStatus trailerUrl")
      .populate("theatre", "name city address")
      .sort({ showTime: 1 }); // upcoming shows first

    if (!shows.length) throw new AppError("No shows found", 404);

    res.status(200).json({ success: true, shows });
  });

  // get shows by movie id
  getShowByMovie = asyncHandler(async (req: Request, res: Response) => {
    const { movieId } = req.params as { movieId: string };

    if (!mongoose.Types.ObjectId.isValid(movieId))
      throw new AppError("Invalid movie id format", 400);

    const shows = await Show.find({ movie: movieId, status: "ACTIVE" })
      .populate("theatre", "name city address")
      .sort({ showTime: 1 });

    if (!shows.length) throw new AppError("No shows found for this movie", 404);
    res.status(200).json({ success: true, shows });
  });

  // get shows by theatre id
  getShowByTheatre = asyncHandler(async (req: Request, res: Response) => {
    const { theatreId } = req.params as { theatreId: string };

    if (!mongoose.Types.ObjectId.isValid(theatreId))
      throw new AppError("Invalid theatre id format", 400);

    const shows = await Show.find({ theatre: theatreId, status: "ACTIVE" })
      .populate("movie", "name language releaseStatus")
      .sort({ showTime: 1 });

    if (!shows.length)
      throw new AppError("No shows found for this theatre", 404);
    res.status(200).json({ success: true, shows });
  });

  // get specific show with seat map
  getShow = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id))
      throw new AppError("Invalid show id format", 400);

    const show = await Show.findById(id)
      .populate("movie", "name language releaseStatus trailerUrl description")
      .populate("theatre", "name city address");

    if (!show) throw new AppError("Show not found", 404);

    // get all seats for this show, sorted by row and seat number
    const seats = await Seat.find({ show: id })
      .select("seatNumber row type price isBooked isLocked")
      .sort({ row: 1, seatNumber: 1 });

    res.status(200).json({ success: true, show, seats });
  });

  // get shows created by current logged in user (theatre owner)
  getMyShows = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const shows = await Show.find({ createdBy: req.user?.id })
      .populate("movie", "name")
      .populate("theatre", "name city")
      .sort({ showTime: -1 })
      .skip(skip)
      .limit(limit);

    if (!shows.length)
      throw new AppError("You have not created any shows yet", 404);

    res.status(200).json({ success: true, page, limit, shows });
  });

  // update show: only before any booking exists, owner, SYSTEM_ADMIN or ROOT_ADMIN
  updateShow = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id))
      throw new AppError("Invalid show id format", 400);

    const show = await Show.findById(id).populate("theatre");
    if (!show) throw new AppError("Show not found", 404);

    const theatre = show.theatre as any;

    // check ownership
    if (!canManageShow(theatre, req.user)) {
      throw new AppError("You can only update your own shows", 403);
    }

    // check locked or booked seats to prevent race condition during payment
    const lockedOrBookedSeats = await Seat.countDocuments({
      show: id,
      $or: [{ isBooked: true }, { isLocked: true }],
    });

    if (lockedOrBookedSeats > 0) {
      throw new AppError(
        "Cannot update show : seats are locked or booked",
        400,
      );
    }

    // only allow updating showTime — other fields require recreating seats
    const { showTime } = req.body;
    if (!showTime) throw new AppError("showTime is required to update", 400);

    show.showTime = showTime;
    await show.save();

    res.status(200).json({ success: true, show });
  });

  // cancel show only owner SYSTEM_ADMIN or ROOT_ADMIN
  cancelShow = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id))
      throw new AppError("Invalid show id format", 400);

    const show = await Show.findById(id).populate("theatre");
    if (!show) throw new AppError("Show not found", 404);

    const theatre = show.theatre as any;

    // check ownership
    if (!canManageShow(theatre, req.user)) {
      throw new AppError("You can only cancel your own shows", 403);
    }

    if (show.status === "CANCELLED")
      throw new AppError("Show is already cancelled", 400);

    if (show.status === "COMPLETED")
      throw new AppError("Cannot cancel a completed show", 400);

    show.status = "CANCELLED";
    await show.save();

    // TODO: trigger refund process for existing bookings
    // TODO: notify users who booked this show

    res.status(200).json({
      success: true,
      message: "Show cancelled successfully",
    });
  });

  // delete show only if NO bookings exist owner, SYSTEM_ADMIN or ROOT_ADMIN
  deleteShow = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id))
      throw new AppError("Invalid show id format", 400);

    const show = await Show.findById(id).populate("theatre");
    if (!show) throw new AppError("Show not found", 404);

    const theatre = show.theatre as any;

    // check ownership
    if (!canManageShow(theatre, req.user)) {
      throw new AppError("You can only delete your own shows", 403);
    }

    // check locked or booked seats to prevent race condition during payment
    const lockedOrBookedSeats = await Seat.countDocuments({
      show: id,
      $or: [{ isBooked: true }, { isLocked: true }],
    });

    if (lockedOrBookedSeats > 0) {
      throw new AppError(
        "Cannot delete show : seats are locked or booked. Cancel instead.",
        400,
      );
    }

    // delete all seats belonging to this show first
    await Seat.deleteMany({ show: id });

    // then delete the show
    await Show.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Show deleted successfully",
    });
  });
}

export default new ShowController();
