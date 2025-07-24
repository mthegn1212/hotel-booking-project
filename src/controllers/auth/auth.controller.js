const authService = require("../../services/auth.service");
const User = require("../../models/user.model");
const generateJWT = require("../../utils/jwt");
const { isEmail, isPhone } = require("../../utils/validate");
const otpService = require("../../services/otp.service");
const bcrypt = require("bcryptjs");

// Hàm sinh OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Đăng ký
exports.register = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);
    
    res.status(201).json({ 
      message: result.message || "Đăng ký thành công!",
      user: result.user,
      token: result.token
    });
  } catch (err) {
    res.status(err.status || 500).json({ 
      error: err.message || "Lỗi trong quá trình đăng ký" 
    });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);
    res.status(200).json({
      message: "Đăng nhập thành công!",
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(err.status || 500).json({ error: err.message });
  }
};

// Đăng xuất
exports.logout = async (req, res) => {
  try {
    // Có thể thêm logic blacklist token ở đây nếu cần
    res.status(200).json({ 
      message: "Đăng xuất thành công. Vui lòng xoá token phía client!" 
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ 
      error: "Lỗi trong quá trình đăng xuất!" 
    });
  }
};

// Kiểm tra tồn tại email
exports.checkEmail = async (req, res) => {
  const { email } = req.body;
  
  if (!email || !email.trim()) {
    return res.status(400).json({ error: "Email không được để trống" });
  }

  if (!isEmail(email.trim())) {
    return res.status(400).json({ error: "Email không hợp lệ" });
  }

  try {
    const exists = await authService.checkUserByEmail(email.trim());
    res.status(200).json({ exists });
  } catch (err) {
    console.error("Check email error:", err);
    res.status(500).json({ error: "Lỗi hệ thống khi kiểm tra email!" });
  }
};

// Kiểm tra tồn tại phone
exports.checkPhone = async (req, res) => {
  const { phone } = req.body;
  
  if (!phone || !phone.trim()) {
    return res.status(400).json({ error: "Số điện thoại không được để trống" });
  }

  const cleanPhone = phone.trim().replace(/\s+/g, "").replace("+", "");
  
  if (!isPhone(cleanPhone)) {
    return res.status(400).json({ error: "Số điện thoại không hợp lệ" });
  }

  try {
    const exists = await authService.checkUserByPhone(cleanPhone);
    res.status(200).json({ exists });
  } catch (err) {
    console.error("Check phone error:", err);
    res.status(500).json({ error: "Lỗi hệ thống khi kiểm tra số điện thoại!" });
  }
};

// Gửi OTP
exports.sendOTP = async (req, res) => {
  const { email, phone } = req.body;
  const input = email || phone;
  
  if (!input || !input.trim()) {
    return res.status(400).json({ error: "Thiếu email hoặc số điện thoại" });
  }

  const cleanInput = input.trim();
  let finalInput = cleanInput;
  
  // Validate input format
  if (email) {
    if (!isEmail(cleanInput)) {
      return res.status(400).json({ error: "Email không hợp lệ" });
    }
  } else {
    finalInput = cleanInput.replace(/\s+/g, "").replace("+", "");
    if (!isPhone(finalInput)) {
      return res.status(400).json({ error: "Số điện thoại không hợp lệ" });
    }
  }

  try {
    const otp = generateOTP();
    
    // Store OTP with expiration (usually 5-10 minutes)
    await otpService.storeOTP(finalInput, otp);
    
    // Send OTP via email or SMS
    await otpService.send(finalInput, otp);

    // In development mode, return OTP for testing
    if (process.env.NODE_ENV === 'development') {
      return res.status(200).json({ 
        message: "OTP đã được gửi!", 
        otp: otp,
        debug: { input: finalInput }
      });
    }

    res.status(200).json({ message: "OTP đã được gửi!" });
  } catch (err) {
    console.error("sendOTP error:", err);
    res.status(500).json({ 
      error: "Không thể gửi OTP. Vui lòng thử lại!" 
    });
  }
};

// Xác minh OTP
exports.verifyOTP = async (req, res) => {
  const { email, phone, otp } = req.body;
  const rawInput = email || phone;
  
  if (!rawInput || !rawInput.trim()) {
    return res.status(400).json({ error: "Thiếu email hoặc số điện thoại" });
  }
  
  if (!otp || !otp.trim()) {
    return res.status(400).json({ error: "Thiếu mã OTP" });
  }

  const cleanInput = rawInput.trim();
  let finalInput = cleanInput;
  
  // Clean and validate input
  if (email) {
    if (!isEmail(cleanInput)) {
      return res.status(400).json({ error: "Email không hợp lệ" });
    }
  } else {
    finalInput = cleanInput.replace(/\s+/g, "").replace("+", "");
    if (!isPhone(finalInput)) {
      return res.status(400).json({ error: "Số điện thoại không hợp lệ" });
    }
  }

  const cleanOTP = otp.trim();
  
  if (!/^\d{6}$/.test(cleanOTP)) {
    return res.status(400).json({ error: "OTP phải là 6 chữ số" });
  }

  try {
    const valid = await otpService.verify(finalInput, cleanOTP);
    
    if (!valid) {
      return res.status(400).json({ error: "OTP không đúng hoặc đã hết hạn" });
    }

    // Remove OTP after successful verification to prevent reuse
    await otpService.removeOTP(finalInput);

    return res.status(200).json({ 
      success: true, 
      verified: finalInput,
      message: "OTP xác thực thành công"
    });
  } catch (err) {
    console.error("verifyOTP error:", err);
    return res.status(500).json({
      error: process.env.NODE_ENV === "development" 
        ? err.message 
        : "Xác minh OTP thất bại. Vui lòng thử lại!"
    });
  }
};

// Refresh token (optional)
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ error: "Thiếu refresh token" });
    }

    const data = await authService.refreshToken(refreshToken);
    res.status(200).json(data);
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(err.status || 401).json({ 
      error: err.message || "Refresh token không hợp lệ" 
    });
  }
};

exports.resetPassword = async (req, res) => {
  const { phone, newPassword } = req.body;

  if (!phone || !newPassword) {
    return res.status(400).json({ error: "Thiếu số điện thoại hoặc mật khẩu mới" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: "Mật khẩu phải có ít nhất 6 ký tự" });
  }

  try {
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy người dùng với số điện thoại này" });
    }

    // Băm mật khẩu mới
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    return res.status(200).json({ message: "Đặt lại mật khẩu thành công!" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ error: "Lỗi máy chủ khi đặt lại mật khẩu" });
  }
};

// Google OAuth callback
exports.googleCallback = async (req, res) => {
  try {
    // Tạm thời chỉ báo callback hoạt động
    res.status(200).json({ message: "Xử lý Google OAuth callback thành công (demo)" });
  } catch (err) {
    console.error("Google callback error:", err);
    res.status(500).json({ error: "Lỗi xử lý Google OAuth" });
  }
};

// Facebook OAuth callback
exports.facebookCallback = async (req, res) => {
  try {
    res.status(200).json({ message: "Xử lý Facebook OAuth callback thành công (demo)" });
  } catch (err) {
    console.error("Facebook callback error:", err);
    res.status(500).json({ error: "Lỗi xử lý Facebook OAuth" });
  }
};

// Apple OAuth callback
exports.appleCallback = async (req, res) => {
  try {
    res.status(200).json({ message: "Xử lý Apple OAuth callback thành công (demo)" });
  } catch (err) {
    console.error("Apple callback error:", err);
    res.status(500).json({ error: "Lỗi xử lý Apple OAuth" });
  }
};