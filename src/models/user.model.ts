import mongoose from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: "CLIENT" | "USER" | "SYSTEM_ADMIN" | "ROOT_ADMIN";
  refreshToken?: string;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Invalid email format",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["CLIENT", "USER", "SYSTEM_ADMIN", "ROOT_ADMIN"],
      default: "CLIENT",
    },
    refreshToken: {
      type: String,
      select: false, // never returned in queries
    },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 });

const User = mongoose.model<IUser>("User", userSchema);

export default User;
