const authService = require("../../services/auth.service");
const User = require("../../models/user.model");
const generateJWT = require("../../utils/jwt");
const { isEmail, isPhone } = require("../../utils/validate");
const otpService = require("../../services/otp.service");

// Đăng ký
exports.register = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json({ message: result });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const data = await authService.loginUser(req.body);
    res.status(200).json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// Đăng xuất
exports.logout = async (_req, res) => {
  try {
    res.status(200).json({ message: "Đăng xuất thành công. Vui lòng xoá token phía client!" });
  } catch {
    res.status(500).json({ message: "Lỗi trong quá trình logout!" });
  }
};

// Kiểm tra email hoặc số điện thoại đã tồn tại
exports.checkUser = async (req, res) => {
  const { emailOrPhone } = req.body;
  const cleaned = emailOrPhone.trim().replace(/\s+/g, "").replace("+", "");

  try {
    const exists = await User.findOne({
      $or: [
        { email: cleaned },
        { phone: cleaned },
      ],
    });
    res.status(200).json({ exists: !!exists });
  } catch {
    res.status(500).json({ error: "Lỗi kiểm tra tài khoản!" });
  }
};

// Hàm sinh OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Gửi OTP
exports.sendOTP = async (req, res) => {
  const input = req.body.email ?? req.body.phone;
  if (!input) {
    return res.status(400).json({ error: "Thiếu email hoặc số điện thoại" });
  }
  try {
    const otp = generateOTP();
    await otpService.storeOTP(input, otp);
    await otpService.send(input, otp);
    // nếu dev thì trả luôn OTP
    if (process.env.NODE_ENV === 'development') {
      return res.status(200).json({ message: "OTP đã được gửi!", otp });
    }
    // production chỉ trả message
    res.status(200).json({ message: "OTP đã được gửi!" });
  } catch (err) {
    console.error("sendOTP error:", err);
    res.status(500).json({ error: "Không gửi được OTP!" });
  }
};

// Xác minh OTP
exports.verifyOTP = async (req, res) => {
  // 1) Lấy thô và clean input
  const raw = req.body.email ?? req.body.phone;
  const otp = req.body.otp;
  if (!raw || !otp) {
    return res.status(400).json({ error: "Thiếu email/sđt hoặc OTP" });
  }
  const input = raw.trim().replace(/\s+/g, "").replace("+", "");

  try {
    // 2) Verify OTP
    const valid = await otpService.verify(input, otp);
    if (!valid) {
      return res.status(400).json({ error: "OTP không đúng hoặc đã hết hạn" });
    }

    // 3) Tìm hoặc tạo user
    let user = await User.findOne({
      $or: [
        { email: isEmail(input) ? input : null },
        { phone: isPhone(input) ? input : null },
      ],
    });
    if (!user) {
      user = await User.create({
        email: isEmail(input) ? input : null,
        phone: isPhone(input) ? input : null,
        role: "customer",
      });
    }

    // 4) Cấp token
    const token = generateJWT(user._id);
    return res.json({ token, user });
  } catch (err) {
    console.error("verifyOTP error:", err);
    // Nếu dev, trả luôn message chi tiết
    if (process.env.NODE_ENV === "development") {
      return res.status(500).json({ error: err.message });
    }
    // Prod chỉ chung chung
    return res.status(500).json({ error: "Xác minh OTP thất bại" });
  }
};