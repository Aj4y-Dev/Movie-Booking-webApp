import { Request, Response } from "express";
import Movie from "../models/movie.model.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

class MovieController {
  //get all movies
  getAllMovies = asyncHandler(async (req: Request, res: Response) => {
    const allMovies = await Movie.find();

    if (!allMovies.length) throw new AppError("No movies found", 404);

    res.status(200).json({ success: true, allMovies });
  });

  //get specific movie by id
  getMovie = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id))
      throw new AppError("Invalid id format", 400);

    const movie = await Movie.findById(id);

    if (!movie) throw new AppError("Movie not found", 404);

    res.status(200).json({ success: true, movie });
  });

  //create a movie
  createNewMovie = asyncHandler(async (req: Request, res: Response) => {
    const {
      name,
      description,
      casts,
      trailerUrl,
      language,
      releaseDate,
      director,
      releaseStatus,
    } = req.body;

    if (
      !name ||
      !description ||
      !casts ||
      !trailerUrl ||
      !language ||
      !releaseDate ||
      !director
    ) {
      throw new AppError("All fields are required", 400);
    }

    const movie = new Movie({
      name,
      description,
      casts,
      trailerUrl,
      language,
      releaseDate,
      director,
      releaseStatus,
    });

    const saveMovie = await movie.save();

    res.status(201).json({ success: true, saveMovie });
  });

  //update a specific movie
  updateSpecificMovie = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id))
      throw new AppError("Invalid id format", 400);

    const updatedMovie = await Movie.findByIdAndUpdate(
      id,
      { ...req.body },
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedMovie) throw new AppError("Movie not found", 404);

    res.status(200).json({ success: true, updatedMovie });
  });

  //Delte the specific movie
  deleteSpecifcMovie = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id))
      throw new AppError("Invalid id format", 400);

    const deletedMovie = await Movie.findByIdAndDelete(id);

    if (!deletedMovie) throw new AppError("Movie not found", 404);

    res.status(200).json({ success: true, deletedMovie });
  });
}

export default new MovieController();
