import mongoose from "mongoose";

export interface ISeat {
  show: mongoose.Types.ObjectId;
  seatNumber: string;
  row: string;
  type: "STANDARD" | "PREMIUM" | "VIP";
  price: number;
  isBooked: boolean;
  bookedBy?: mongoose.Types.ObjectId; //optional until booked
  isLocked: boolean;
  lockedBy?: mongoose.Types.ObjectId;
  lockedAt?: Date;
  lockExpiresAt?: Date;
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
    type: {
      type: String,
      enum: ["STANDARD", "PREMIUM", "VIP"],
      default: "STANDARD",
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
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
    isLocked: {
      type: Boolean,
      default: false,
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    lockedAt: {
      type: Date,
      default: null,
    },
    lockExpiresAt: {
      type: Date,
      default: null,
      // TTL handled in controller — after this time seat is free
    },
  },
  { timestamps: true },
);

seatSchema.index({ show: 1 });
seatSchema.index({ show: 1, seatNumber: 1 }, { unique: true }); // no duplicate seats in same show
seatSchema.index({ show: 1, isBooked: 1 }); // quickly find available seats
seatSchema.index({ bookedBy: 1 }); // find all seats booked by a user

seatSchema.index({ show: 1 });
seatSchema.index({ show: 1, seatNumber: 1 }, { unique: true });
seatSchema.index({ show: 1, isBooked: 1 });
seatSchema.index({ show: 1, isLocked: 1 });
seatSchema.index({ lockExpiresAt: 1 });
seatSchema.index({ bookedBy: 1 });

const Seat = mongoose.model("Seat", seatSchema);

export default Seat;
