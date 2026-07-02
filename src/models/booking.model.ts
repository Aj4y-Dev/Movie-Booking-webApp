import mongoose from "mongoose";

export interface IBooking {
  user: mongoose.Types.ObjectId;
  show: mongoose.Types.ObjectId;
  seats: mongoose.Types.ObjectId[];
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "REUNDED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentId?: string;
  bookedAt: Date;
  cancelledAt?: Date;
}

const bookingSchema = new mongoose.Schema<IBooking>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
    },
    seats: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Seat",
      required: true,
      validate: {
        validator: (v: mongoose.Types.ObjectId[]) => v.length > 0,
        message: "At least one seat required",
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "REFUNDED"],
      default: "PENDING",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    paymentId: {
      type: String,
      default: null,
    },
    bookedAt: {
      type: Date,
      default: Date.now,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

bookingSchema.index({ user: 1 });
bookingSchema.index({ show: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ user: 1, show: 1 });

const Booking = mongoose.model<IBooking>("Booking", bookingSchema);
export default Booking;
