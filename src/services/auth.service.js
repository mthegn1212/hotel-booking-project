const User = require("../models/user.model");
const otpService = require("./otp.service");
const generateJWT = require("../utils/jwt");
const { isEmail, isPhone } = require("../utils/validate");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Đăng ký người dùng mới
exports.registerUser = async (userData) => {
  const { name, email, phone, password, role = 'customer' } = userData;
  
  try {
    // Validate input
    if (!name || name.trim().length < 2) {
      throw { status: 400, message: "Tên phải có ít nhất 2 ký tự" };
    }

    if (!password || password.length < 6) {
      throw { status: 400, message: "Mật khẩu phải có ít nhất 6 ký tự" };
    }

    const identifier = email || phone;
    if (!identifier) {
      throw { status: 400, message: "Phải có email hoặc số điện thoại" };
    }

    // Clean and validate identifier
    let cleanEmail = null;
    let cleanPhone = null;

    if (email) {
      cleanEmail = email.trim().toLowerCase();
      if (!isEmail(cleanEmail)) {
        throw { status: 400, message: "Email không hợp lệ" };
      }
    }

    if (phone) {
      cleanPhone = phone.trim().replace(/\s+/g, "").replace("+", "");
      if (!isPhone(cleanPhone)) {
        throw { status: 400, message: "Số điện thoại không hợp lệ" };
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        ...(cleanEmail ? [{ email: cleanEmail }] : []),
        ...(cleanPhone ? [{ phone: cleanPhone }] : [])
      ].filter(Boolean)
    });

    if (existingUser) {
      throw { status: 400, message: "Email hoặc số điện thoại đã được sử dụng" };
    }

    // Create new user
    const newUser = new User({
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password, // Will be hashed by the pre-save middleware
      role,
      email_verified: !!cleanEmail, // Set to true if email registration
      phone_verified: !!cleanPhone, // Set to true if phone registration
    });

    await newUser.save();

    // Generate JWT token
    const token = generateJWT({
      id: newUser._id,
      role: newUser.role,
      email: newUser.email,
      phone: newUser.phone
    });

    return {
      message: "Đăng ký thành công!",
      user: newUser.toJSON(),
      token
    };

  } catch (error) {
    if (error.name === 'ValidationError') {
      throw { 
        status: 400, 
        message: Object.values(error.errors)[0].message 
      };
    }
    throw error;
  }
};


// Đăng nhập người dùng
exports.loginUser = async (loginData) => {
  const { identifier , password } = loginData;
  
  try {
    if (!identifier || !password) {
      throw { status: 400, message: "Thiếu thông tin đăng nhập" };
    }

    // Find user by phone
    const user = await User.findByEmailOrPhone(identifier);
    if (!user) {
      throw { status: 401, message: "Thông tin đăng nhập không chính xác" };
    }

    // Check if account is locked
    if (user.isLocked()) {
      throw { 
        status: 423, 
        message: "Tài khoản đã bị khóa do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau." 
      };
    }

    // Check if account is active
    if (!user.is_active) {
      throw { status: 403, message: "Tài khoản đã bị vô hiệu hóa" };
    }

    // Compare password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      await user.incLoginAttempts();
      throw { status: 401, message: "Thông tin đăng nhập không chính xác" };
    }

    // Reset login attempts on successful login
    if (user.login_attempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Generate tokens
    const token = generateJWT({
      id: user._id,
      role: user.role,
      email: user.email,
      phone: user.phone
    });

    const refreshToken = jwt.sign(
      { id: user._id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      message: "Đăng nhập thành công!",
      token,
      refreshToken,
      user: user.toJSON()
    };

  } catch (error) {
    throw error;
  }
};

// Kiểm tra email đã tồn tại
exports.checkUserByEmail = async (email) => {
  if (!email || !isEmail(email)) {
    throw { status: 400, message: "Email không hợp lệ" };
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: cleanEmail });
  return !!user;
};

//Kiểm tra số điện thoại đã tồn tại
exports.checkUserByPhone = async (phone) => {
  if (!phone || !isPhone(phone)) {
    throw { status: 400, message: "Số điện thoại không hợp lệ" };
  }

  const cleanPhone = phone.trim().replace(/\s+/g, "").replace("+", "");
  const user = await User.findOne({ phone: cleanPhone });
  return !!user;
};

// Refresh token
exports.refreshToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    if (decoded.type !== 'refresh') {
      throw { status: 401, message: "Token không hợp lệ" };
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.is_active) {
      throw { status: 401, message: "User không tồn tại hoặc đã bị vô hiệu hóa" };
    }

    // Generate new tokens
    const newToken = generateJWT({
      id: user._id,
      role: user.role,
      email: user.email,
      phone: user.phone
    });

    const newRefreshToken = jwt.sign(
      { id: user._id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token: newToken,
      refreshToken: newRefreshToken,
      user: user.toJSON()
    };

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw { status: 401, message: "Token không hợp lệ hoặc đã hết hạn" };
    }
    throw error;
  }
};

//Cập nhật thông tin user
exports.updateUserProfile = async (userId, updateData) => {
  try {
    const allowedUpdates = ['name', 'avatar'];
    const updates = {};

    // Filter allowed updates
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key) && updateData[key] !== undefined) {
        updates[key] = updateData[key];
      }
    });

    if (updates.name) {
      updates.name = updates.name.trim();
      if (updates.name.length < 2) {
        throw { status: 400, message: "Tên phải có ít nhất 2 ký tự" };
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw { status: 404, message: "User không tồn tại" };
    }

    return user.toJSON();

  } catch (error) {
    if (error.name === 'ValidationError') {
      throw { 
        status: 400, 
        message: Object.values(error.errors)[0].message 
      };
    }
    throw error;
  }
};

// Đổi mật khẩu
exports.changePassword = async (userId, currentPassword, newPassword) => {
  try {
    if (!currentPassword || !newPassword) {
      throw { status: 400, message: "Thiếu mật khẩu hiện tại hoặc mật khẩu mới" };
    }

    if (newPassword.length < 6) {
      throw { status: 400, message: "Mật khẩu mới phải có ít nhất 6 ký tự" };
    }

    const user = await User.findById(userId);
    if (!user) {
      throw { status: 404, message: "User không tồn tại" };
    }

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      throw { status: 401, message: "Mật khẩu hiện tại không đúng" };
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    return "Đổi mật khẩu thành công!";

  } catch (error) {
    throw error;
  }
};

// Quên mật khẩu
exports.forgotPassword = async (identifier) => {
  try {
    const user = await User.findByEmailOrPhone(identifier);
    if (!user) {
      throw { status: 404, message: "Không tìm thấy tài khoản với thông tin này" };
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id, type: 'reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // In production, you would send this token via email/SMS
    // For now, we'll return it (in development mode only)
    if (process.env.NODE_ENV === 'development') {
      return `Link đặt lại mật khẩu: /reset-password?token=${resetToken}`;
    }

    return "Link đặt lại mật khẩu đã được gửi!";

  } catch (error) {
    throw error;
  }
};


// Đặt lại mật khẩu
exports.resetPassword = async (resetToken, newPassword) => {
  try {
    if (!newPassword || newPassword.length < 6) {
      throw { status: 400, message: "Mật khẩu mới phải có ít nhất 6 ký tự" };
    }

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (decoded.type !== 'reset') {
      throw { status: 401, message: "Token không hợp lệ" };
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw { status: 404, message: "User không tồn tại" };
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    return "Đặt lại mật khẩu thành công!";

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw { status: 401, message: "Token không hợp lệ hoặc đã hết hạn" };
    }
    throw error;
  }
};