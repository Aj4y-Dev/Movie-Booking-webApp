import mongoose from "mongoose";

export interface ISeat {
  show: mongoose.Types.ObjectId;
  seatNumber: string;
  row: string;
  isBooked: boolean;
  bookedBy?: mongoose.Types.ObjectId; //optional until booked
  price: number;
  type: "STANDARD" | "PREMIUM" | "VIP";
}

const seatSchema = new mongoose.Schema<ISeat>(
  {
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
    },
    seatNumber: {
      type: String,
      required: true,
      trim: true,
    },
    row: {
      //row letter "A", "B", "C"
      type: String,
      required: true,
      trim: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    bookedBy: {
      //the user schema need to create
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    type: {
      type: String,
      enum: ["STANDARD", "PREMIUM", "VIP"],
      default: "STANDARD",
    },
  },
  { timestamps: true },
);

seatSchema.index({ show: 1 });
seatSchema.index({ show: 1, seatNumber: 1 }, { unique: true }); // no duplicate seats in same show
seatSchema.index({ show: 1, isBooked: 1 }); // quickly find available seats
seatSchema.index({ bookedBy: 1 }); // find all seats booked by a user

const Seat = mongoose.model<ISeat>("Seat", seatSchema);

export default Seat;
