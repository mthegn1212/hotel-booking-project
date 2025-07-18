// src/models/otp.model.js
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  key:    { type: String, required: true, unique: true }, // email hoặc số điện thoại
  code:   { type: String, required: true },
  expiresAt: { type: Date, required: true }
});

module.exports = mongoose.model("OTP", otpSchema);