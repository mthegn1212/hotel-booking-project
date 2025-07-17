const authService = require("../../services/auth.service");
const User = require("../../models/user.model");
const generateJWT = require("../../utils/jwt");
const { isEmail, isPhone } = require("../../utils/validate");


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

// Send OTP
// Tạo mã OTP ngẫu nhiên
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.sendOTP = async (req, res) => {
  const { emailOrPhone } = req.body;
  try {
    const otp = generateOTP();

    await otpService.storeOTP(emailOrPhone, otp); // Lưu OTP
    await otpService.send(emailOrPhone, otp);     // Gửi OTP (qua email)

    res.status(200).json({ message: "OTP đã được gửi!" });
  } catch (err) {
    res.status(500).json({ error: "Không gửi được OTP!" });
  }
};

// Xác minh OTP
exports.verifyOTP = async (req, res) => {
  const { emailOrPhone, otp } = req.body;

  try {
    const isValid = await otpService.verify(emailOrPhone, otp);
    if (!isValid) {
      return res.status(400).json({ error: "Mã OTP không đúng hoặc đã hết hạn" });
    }

    let user = await User.findOne({
      $or: [
        { email: emailOrPhone },
        { phone: emailOrPhone.replace("+", "") },
      ],
    });

    // Nếu chưa tồn tại -> tạo mới
    if (!user) {
      user = await User.create({
        email: isEmail(emailOrPhone) ? emailOrPhone : null,
        phone: isPhone(emailOrPhone) ? emailOrPhone.replace("+", "") : null,
      });
    }

    const token = generateJWT(user._id);
    res.json({ token, user });
  } catch {
    res.status(500).json({ error: "Xác minh OTP thất bại" });
  }
};