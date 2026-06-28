import mongoose from "mongoose";

export interface IShow {
  movie: mongoose.Types.ObjectId;
  theatre: mongoose.Types.ObjectId;
  showTime: Date;
  price: number;
  totalSeats: number;
  availableSeats: number;
  status: "ACTIVE" | "CANCELLED" | "COMPLETED";
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
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
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
    status: {
      type: String,
      enum: ["ACTIVE", "CANCELLED", "COMPLETED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true },
);

showSchema.index({ movie: 1 });
showSchema.index({ theatre: 1 });
showSchema.index({ showTime: 1 });
showSchema.index({ status: 1 });
showSchema.index({ movie: 1, theatre: 1, showTime: 1 }); // compound — prevent duplicate shows

const Show = mongoose.model<IShow>("Show", showSchema);

export default Show;
