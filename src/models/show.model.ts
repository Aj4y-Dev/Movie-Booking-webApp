import mongoose from "mongoose";

export interface IShow {
  movie: mongoose.Types.ObjectId;
  theatre: mongoose.Types.ObjectId;
  showTime: Date;
  totalSeats: number;
  availableSeats: number;
  standardPrice: number;
  premiumPrice: number;
  vipPrice: number;
  status: "ACTIVE" | "CANCELLED" | "COMPLETED";
  createdBy: mongoose.Types.ObjectId;
}

const showSchema = new mongoose.Schema<IShow>(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      required: true,
    },
    showTime: {
      type: Date,
      required: true,
    },
    totalSeats: {
      type: Number,
      required: true,
      min: [1, "Total seats must be at least 1"],
    },
    availableSeats: {
      type: Number,
      required: true,
      min: [0, "Available seats cannot be negative"],
    },
    standardPrice: {
      type: Number,
      required: true,
      default: 300,
      min: [0, "Price cannot be negative"],
    },
    premiumPrice: {
      type: Number,
      required: true,
      default: 500,
      min: [0, "Price cannot be negative"],
    },
    vipPrice: {
      type: Number,
      required: true,
      default: 700,
      min: [0, "Price cannot be negative"],
    },
    status: {
      type: String,
      enum: ["ACTIVE", "CANCELLED", "COMPLETED"],
      default: "ACTIVE",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

showSchema.index({ movie: 1 });
showSchema.index({ theatre: 1 });
showSchema.index({ showTime: 1 });
showSchema.index({ status: 1 });
showSchema.index({ createdBy: 1 });
showSchema.index({ movie: 1, theatre: 1, showTime: 1 }, { unique: true });

const Show = mongoose.model<IShow>("Show", showSchema);

export default Show;
