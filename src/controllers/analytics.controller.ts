import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";
import Theatre from "../models/theatre.model.js";
import Booking from "../models/booking.model.js";

class AnalyticsController {
  // get full analytics for theatre owner
  getOwnerAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const ownerId = new mongoose.Types.ObjectId(req.user?.id); //mongoose.Types.ObjectId is an ES6 class, and JavaScript classes must be instantiated with new.

    // get all theatres owned by this user
    const theatres = await Theatre.find({ owner: ownerId }).select(
      "_id name city",
    );

    if (!theatres.length)
      throw new AppError("No theatres found for this owner", 404);

    const theatreIds = theatres.map((t) => t._id);

    // 1. total revenue
    // find all shows in owner's theatres
    // then find all confirmed bookings for those shows
    const revenueResult = await Booking.aggregate([
      {
        $lookup: {
          from: "shows", // join with shows collection
          localField: "show", // booking.show
          foreignField: "_id", // show._id
          as: "showData",
        },
      },
      { $unwind: "$showData" }, // flatten showData array
      {
        $match: {
          "showData.theatre": { $in: theatreIds }, // only owner's theatres
          status: "CONFIRMED", // only confirmed bookings
          paymentStatus: "PAID", // only paid
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalBookings: { $count: {} },
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    const totalBookings = revenueResult[0]?.totalBookings || 0;

    //2. revenue per theatre
    const revenuePerTheatre = await Booking.aggregate([
      {
        $lookup: {
          from: "shows",
          localField: "show",
          foreignField: "_id",
          as: "showData",
        },
      },
      { $unwind: "$showData" },
      {
        $match: {
          "showData.theatre": { $in: theatreIds },
          status: "CONFIRMED",
          paymentStatus: "PAID",
        },
      },
      {
        $group: {
          _id: "$showData.theatre", // group by theatre
          revenue: { $sum: "$totalAmount" },
          bookings: { $count: {} },
          totalSeatsBooked: { $sum: { $size: "$seats" } },
        },
      },
      {
        $lookup: {
          from: "theatres",
          localField: "_id",
          foreignField: "_id",
          as: "theatreInfo",
        },
      },
      { $unwind: "$theatreInfo" },
      {
        $project: {
          theatreId: "$_id",
          theatreName: "$theatreInfo.name",
          city: "$theatreInfo.city",
          revenue: 1,
          bookings: 1,
          totalSeatsBooked: 1,
        },
      },
      { $sort: { revenue: -1 } }, // highest revenue first
    ]);

    //3. revenue per show
    const revenuePerShow = await Booking.aggregate([
      {
        $lookup: {
          from: "shows",
          localField: "show",
          foreignField: "_id",
          as: "showData",
        },
      },
      { $unwind: "$showData" },
      {
        $match: {
          "showData.theatre": { $in: theatreIds },
          status: "CONFIRMED",
          paymentStatus: "PAID",
        },
      },
      {
        $group: {
          _id: "$show",
          revenue: { $sum: "$totalAmount" },
          bookings: { $count: {} },
          totalSeatsBooked: { $sum: { $size: "$seats" } },
          showTime: { $first: "$showData.showTime" },
          availableSeats: { $first: "$showData.availableSeats" },
          totalSeats: { $first: "$showData.totalSeats" },
        },
      },
      {
        $lookup: {
          from: "movies",
          localField: "showData.movie",
          foreignField: "_id",
          as: "movieInfo",
        },
      },
      {
        $lookup: {
          from: "shows",
          localField: "_id",
          foreignField: "_id",
          as: "showInfo",
        },
      },
      { $unwind: "$showInfo" },
      {
        $lookup: {
          from: "movies",
          localField: "showInfo.movie",
          foreignField: "_id",
          as: "movieInfo",
        },
      },
      { $unwind: { path: "$movieInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          showId: "$_id",
          movieName: "$movieInfo.name",
          showTime: 1,
          revenue: 1,
          bookings: 1,
          totalSeatsBooked: 1,
          totalSeats: 1,
          availableSeats: 1,
          occupancyRate: {
            $multiply: [
              {
                $divide: [
                  { $subtract: ["$totalSeats", "$availableSeats"] },
                  "$totalSeats",
                ],
              },
              100, // percentage
            ],
          },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        overview: {
          totalRevenue,
          totalBookings,
          totalTheatres: theatres.length,
        },
        revenuePerTheatre,
        revenuePerShow,
      },
    });
  });
}

export default new AnalyticsController();
