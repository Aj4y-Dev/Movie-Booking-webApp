import mongoose from "mongoose";

interface IMovie {
  name: string;
  description: string;
  casts: string[];
  trailerUrl: string;
  language: string[];
  releaseDate: Date;
  director: string;
  releaseStatus: "PENDING" | "UPCOMING" | "RELEASED";
}

const movieSchema = new mongoose.Schema<IMovie>(
  {
    name: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 100,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 1000,
    },
    casts: {
      type: [String],
      required: true,
    },
    trailerUrl: {
      type: String,
      required: true,
    },
    language: {
      type: [String],
      required: true,
      default: ["Nepali"],
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    director: {
      type: String,
      required: true,
      trim: true,
    },
    releaseStatus: {
      type: String,
      enum: ["PENDING", "UPCOMING", "RELEASED"],
      default: "PENDING",
    },
  },
  { timestamps: true },
);

const Movie = mongoose.model<IMovie>("Movie", movieSchema);

export default Movie;
