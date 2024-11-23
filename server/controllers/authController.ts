import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { User } from "../models/userModel";

/**
 * Function to send an email using Nodemailer
 */
const sendEmail = async (
  email: string,
  subject: string,
  message: string
): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Replace with your email provider
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // Your email password or app password
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    text: message,
  });
};

/**
 * Send OTP to the user's email
 */
export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ message: "Invalid or missing email" });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    // Update or insert the OTP and expiry into the user record
    await User.findOneAndUpdate(
      { email },
      { otp, otpExpiry },
      { upsert: true, new: true }
    );

    // Send the OTP via email
    await sendEmail(email, "Your OTP for HD Notes", `Your OTP is: ${otp}`);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({ message: "Error sending OTP", error: errorMessage });
  }
};

/**
 * Signup a user using OTP verification
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, dateOfBirth, otp } = req.body;

    if (!name) {
      res.status(400).json({ message: "Name is required" });
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ message: "Invalid or missing email" });
      return;
    }
    if (!dateOfBirth || isNaN(Date.parse(dateOfBirth))) {
      res.status(400).json({ message: "Invalid or missing date of birth" });
      return;
    }
    if (!otp || otp.length !== 6) {
      res.status(400).json({ message: "OTP must be 6 digits" });
      return;
    }

    const user = await User.findOne({ email });
    if (
      !user ||
      user.otp !== otp ||
      !user.otpExpiry ||
      user.otpExpiry < new Date()
    ) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    user.name = name;
    user.dateOfBirth = new Date(dateOfBirth);
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    res.status(201).json({ token });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    res
      .status(500)
      .json({ message: "Error creating user", error: errorMessage });
  }
};
