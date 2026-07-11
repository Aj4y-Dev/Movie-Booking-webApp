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

    // Check if the movie already exists
    const existingMovie = await Movie.findOne({
      name: name.trim(),
      director: director.trim(),
      releaseDate: new Date(releaseDate),
    });

    if (existingMovie) {
      throw new AppError("Movie already exists", 409);
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
      createdBy: req.user?.id,
    });

    const saveMovie = await movie.save();

    res.status(201).json({ success: true, saveMovie });
  });

  //update a specific movie
  updateSpecificMovie = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id))
      throw new AppError("Invalid id format", 400);

    const updatedMovie = await Movie.findOneAndUpdate(
      {
        _id: id,
        createdBy: req.user?.id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedMovie)
      throw new AppError("Movie not found or unauthorized movie", 404);

    res.status(200).json({ success: true, updatedMovie });
  });

  //Delete the specific movie
  deleteSpecificMovie = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id))
      throw new AppError("Invalid id format", 400);

    const deletedMovie = await Movie.findOneAndDelete({
      _id: id,
      createdBy: req.user?.id,
    });

    if (!deletedMovie)
      throw new AppError("Movie not found or unauthorized movie", 404);

    res.status(200).json({ success: true, deletedMovie });
  });

  //search query
  searchMovies = asyncHandler(async (req: Request, res: Response) => {
    const { name, director, language, releaseStatus } = req.query;

    const filter: Record<string, unknown> = {};

    // escapes special regex characters like . * + ? ^ $ { } [ ] | ( ) \
    const escapeRegex = (value: string) =>
      value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    if (name)
      filter.name = { $regex: escapeRegex(name as string), $options: "i" }; // $regex = partial match - "nolan" matches "Christopher Nolan" $options: "i" = case insensitive - "NOLAN" matches "nolan"
    if (director)
      filter.director = {
        $regex: escapeRegex(director as string),
        $options: "i",
      };
    if (language) filter.language = { $in: [language as string] }; // $in = checks if value exists inside an array
    if (releaseStatus)
      // exact match - no regex needed since it's an enum value must be "PENDING", "UPCOMING" or "RELEASED"
      filter.releaseStatus = releaseStatus as
        | "PENDING"
        | "UPCOMING"
        | "RELEASED";

    const movies = await Movie.find(filter);

    if (!movies.length) throw new AppError("No movies found", 404);
    res.status(200).json({ success: true, movies });
  });
}

export default new MovieController();
