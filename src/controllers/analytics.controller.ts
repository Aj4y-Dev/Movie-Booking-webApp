import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";
import Theatre from "../models/theatre.model.js";
import Booking from "../models/booking.model.js";
import Payment from "../models/payment.model.js";

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

    //4. monthly revenue
    const monthlyRevenue = await Booking.aggregate([
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
          _id: {
            year: { $year: "$bookedAt" },
            month: { $month: "$bookedAt" },
          },
          revenue: { $sum: "$totalAmount" },
          bookings: { $count: {} },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } }, // latest first
      { $limit: 12 }, // last 12 months
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          revenue: 1,
          bookings: 1,
        },
      },
    ]);

    //5. seat type breakdown
    // how much revenue from STANDARD vs PREMIUM vs VIP

    const seatTypeRevenue = await Booking.aggregate([
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
      { $unwind: "$seats" }, // flatten seats array
      {
        $lookup: {
          from: "seats",
          localField: "seats",
          foreignField: "_id",
          as: "seatInfo",
        },
      },
      { $unwind: "$seatInfo" },
      {
        $group: {
          _id: "$seatInfo.type", // STANDARD, PREMIUM, VIP
          revenue: { $sum: "$seatInfo.price" },
          count: { $count: {} },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          revenue: 1,
          count: 1,
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    //6. payment summary
    const paymentSummary = await Payment.aggregate([
      {
        $lookup: {
          from: "bookings",
          localField: "booking",
          foreignField: "_id",
          as: "bookingData",
        },
      },
      { $unwind: "$bookingData" },
      {
        $lookup: {
          from: "shows",
          localField: "bookingData.show",
          foreignField: "_id",
          as: "showData",
        },
      },
      { $unwind: "$showData" },
      {
        $match: {
          "showData.theatre": { $in: theatreIds },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $count: {} },
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
          totalAmount: 1,
        },
      },
    ]);

    //7. top performing shows
    const topShows = await Booking.aggregate([
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
          showTime: { $first: "$showData.showTime" },
          totalSeats: { $first: "$showData.totalSeats" },
          availableSeats: { $first: "$showData.availableSeats" },
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
        $lookup: {
          from: "theatres",
          localField: "showInfo.theatre",
          foreignField: "_id",
          as: "theatreInfo",
        },
      },
      { $unwind: { path: "$theatreInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          movieName: "$movieInfo.name",
          theatreName: "$theatreInfo.name",
          showTime: 1,
          revenue: 1,
          bookings: 1,
          occupancyRate: {
            $multiply: [
              {
                $divide: [
                  { $subtract: ["$totalSeats", "$availableSeats"] },
                  "$totalSeats",
                ],
              },
              100,
            ],
          },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }, // top 5 shows
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
        monthlyRevenue,
        seatTypeRevenue,
        paymentSummary,
        topShows,
      },
    });
  });
}

export default new AnalyticsController();
