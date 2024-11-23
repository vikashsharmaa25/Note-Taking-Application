import express from "express";
import { sendOtp, signup } from "../controllers/authController";

const router = express.Router();

router.post("/send-otp", sendOtp);

router.post("/signup", signup);

export default router;
