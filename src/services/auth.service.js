const User = require("../models/user.model");
const OTP = require("../models/otp.model");
const generateJWT = require("../utils/jwt");
const { isEmail, isPhone } = require("../utils/validate");
const sendEmail = require("../utils/mailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Gửi mã OTP qua email
exports.sendOtpByEmail = async (email) => {
  // Kiểm tra email đã đăng ký chưa
  const existingUser = await User.findOne({ email });
  if (existingUser) throw { status: 400, message: "Email đã tồn tại!" };

  // Tạo mã OTP ngẫu nhiên
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Lưu OTP vào DB (ghi đè nếu đã tồn tại)
  await OTP.findOneAndUpdate(
    { email },
    {
      code: otpCode,
      expiresAt: Date.now() + 5 * 60 * 1000, // hết hạn sau 5 phút
    },
    { upsert: true, new: true }
  );

  // Gửi email
  const subject = "Mã xác minh OTP của bạn";
  const html = `<p>Mã OTP của bạn là: <b>${otpCode}</b></p><p>Mã có hiệu lực trong 5 phút.</p>`;

  await sendEmail({
    to: email,
    subject,
    html,
  });

  return "Mã OTP đã được gửi tới email!";
};

// Xác minh OTP
exports.verifyOtp = async ({ email, code }) => {
  const otpRecord = await OTP.findOne({ email });

  if (!otpRecord || otpRecord.code !== code) {
    throw { status: 400, message: "Mã OTP không đúng!" };
  }

  if (otpRecord.expiresAt < Date.now()) {
    await OTP.deleteOne({ email });
    throw { status: 400, message: "Mã OTP đã hết hạn!" };
  }

  await OTP.deleteOne({ email }); // Xóa OTP sau khi dùng
  return "Xác minh OTP thành công!";
};

// Đăng ký người dùng
exports.registerUser = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw { status: 400, message: "Email đã tồn tại!" };

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, password: hashedPassword, role });
  await newUser.save();

  return "Đăng ký thành công!";
};

// Đăng nhập
exports.loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw { status: 404, message: "Người dùng không tồn tại" };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw { status: 400, message: "Sai mật khẩu" };

  const token = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

// Kiểm tra email hoặc số điện thoại đã tồn tại
exports.checkEmailOrPhoneExists = async (input) => {
  const user = await User.findOne({
    $or: [
      { email: input },
      { phone: input.replace("+", "") },
    ],
  });
  return !!user;
};