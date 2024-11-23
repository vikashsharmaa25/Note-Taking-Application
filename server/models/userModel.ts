import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    otp: String,
    otpExpiry: Date,
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
