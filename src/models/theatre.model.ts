import mongoose from "mongoose";

export interface ITheatre {
  name: string;
  description?: string;
  city: string;
  postalCode: string;
  address: string;
  owner: mongoose.Types.ObjectId; // CLIENT who owns this theatre
}

const theatreSchema = new mongoose.Schema<ITheatre>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{5}$/, "Invalid postal code — must be 5 digits"], // for nepal always 5 digits
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // CLIENT who owns and manages this theatre
    },
  },
  {
    timestamps: true,
  },
);

theatreSchema.index({ city: 1 });
theatreSchema.index({ postalCode: 1 });
theatreSchema.index({ owner: 1 }); // find all theatres owned by a user

const Theatre = mongoose.model<ITheatre>("Theatre", theatreSchema);

export default Theatre;
