import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import Theatre from "../models/theatre.model.js";
import mongoose from "mongoose";

class TheatreController {
  //get All theatres
  getAllTheatres = asyncHandler(async (req: Request, res: Response) => {
    const theatres = await Theatre.find();

    if (!theatres.length) throw new AppError("No Theatres found", 404);

    res.status(200).json({ success: true, theatres });
  });

  //get Specific theater
  getSpecificTheatre = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id))
      throw new AppError("Invalid id format", 400);

    const theatre = await Theatre.findById(id);

    if (!theatre) throw new AppError("Theatre not found", 404);

    res.status(200).json({ success: true, theatre });
  });

  //Create new Theater
  createNewTheatre = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, city, postalCode, address } = req.body;

    if (!name || !city || !postalCode || !address) {
      throw new AppError("All fields required", 400);
    }

    const createTheatre = new Theatre({
      name,
      description,
      city,
      postalCode,
      address,
    });

    const theatre = await createTheatre.save();

    res.status(201).json({ success: true, theatre });
  });

  //update specific theatre
  updateSpecificTheatre = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id))
      throw new AppError("Invalid id format", 400);

    const updateTheatre = await Theatre.findByIdAndUpdate(
      id,
      { ...req.body },
      { returnDocument: "after", runValidators: true },
    );

    if (!updateTheatre) throw new AppError("Theatre not found", 404);

    res.status(200).json({ success: true, updateTheatre });
  });

  //delete specific theatre
  deleteSpecificTheatre = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id))
      throw new AppError("Invalid id format", 400);

    const deleteTheatre = await Theatre.findByIdAndDelete(id);

    if (!deleteTheatre) throw new AppError("Theatre not found", 404);

    res.status(200).json({ success: true, deleteTheatre });
  });
}

export default new TheatreController();
