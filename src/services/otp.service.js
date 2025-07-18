// src/services/otp.service.js
const OTP = require("../models/otp.model");
const sendEmail = require("../utils/mailer");

// Lưu hoặc cập nhật OTP
exports.storeOTP = async (key, code) => {
  const expiresAt = Date.now() + 5*60*1000; // 5 phút
  await OTP.findOneAndUpdate(
    { key },
    { code, expiresAt },
    { upsert: true, new: true }
  );
};

// Gửi OTP — nếu key là email thì email, nếu phone thì chỉ log ra console (dev stub)
exports.send = async (key, code) => {
  if (key.includes("@")) {
    // gửi email
    await sendEmail({
      to: key,
      subject: "Mã OTP của bạn",
      html: `<p>Mã OTP của bạn là: <b>${code}</b>.</p><p>Hết hạn sau 5 phút.</p>`
    });
  } else {
    // chưa tích hợp SMS, chỉ hiển thị log
    console.log(`DEV MODE: gửi SMS OTP ${code} tới ${key}`);
  }
};

// Verify OTP
exports.verify = async (key, code) => {
  const record = await OTP.findOne({ key });
  if (!record) return false;
  if (record.code !== code) return false;
  if (record.expiresAt < Date.now()) {
    await OTP.deleteOne({ key });
    return false;
  }
  await OTP.deleteOne({ key });
  return true;
};