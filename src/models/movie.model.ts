import mongoose from "mongoose";

export interface IMovie {
  name: string;
  description: string;
  casts: string[];
  trailerUrl: string;
  language: string[];
  releaseDate: Date;
  director: string;
  releaseStatus: "PENDING" | "UPCOMING" | "RELEASED";
  createdBy: mongoose.Types.ObjectId;
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

movieSchema.index({ releaseStatus: 1 });
movieSchema.index({ language: 1 });
movieSchema.index({ releaseDate: -1 }); // -1 = descending, latest first
movieSchema.index({ name: 1 });
movieSchema.index({ director: 1 });
movieSchema.index({ createdBy: 1 });

const Movie = mongoose.model<IMovie>("Movie", movieSchema);

export default Movie;
