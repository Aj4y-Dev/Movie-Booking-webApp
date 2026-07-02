import mongoose from "mongoose";

export interface IPayment {
  booking: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  transactionId: string;
  paymentDate?: Date;
}

const paymentSchema = new mongoose.Schema<IPayment>(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ transactionId: 1 }, { unique: true });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model<IPayment>("Payment", paymentSchema);
export default Payment;
