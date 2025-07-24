const express = require('express');
const router = express.Router();
const authController = require('../../../controllers/auth/auth.controller');
const verifyToken = require('../../../middlewares/auth/verifyToken');
const validate = require("../../../middlewares/validate/validate");

const {
  registerSchema,
  loginSchema,
  otpSchema,
  emailSchema,
  phoneSchema,
} = require('../../../validations/auth.validation');

// Rate limiting middleware (optional)
const rateLimit = require('express-rate-limit');

// Rate limit for OTP endpoints
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: "Quá nhiều yêu cầu OTP. Vui lòng thử lại sau 15 phút." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { error: "Quá nhiều yêu cầu đăng nhập/đăng ký. Vui lòng thử lại sau." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  if (req.body.email) {
    req.body.email = req.body.email.trim().toLowerCase();
  }
  if (req.body.phone) {
    req.body.phone = req.body.phone.trim().replace(/\s+/g, "").replace("+", "");
  }
  if (req.body.name) {
    req.body.name = req.body.name.trim();
  }
  if (req.body.otp) {
    req.body.otp = req.body.otp.trim();
  }
  next();
};

// Kiểm tra tồn tại email/phone
router.post('/check-email', 
  authLimiter,
  sanitizeInput,
  validate(emailSchema),
  authController.checkEmail
);

router.post('/check-phone', 
  authLimiter,
  sanitizeInput,
  validate(phoneSchema),
  authController.checkPhone
);

// Gửi và xác thực OTP
router.post('/send-otp', 
  otpLimiter,
  sanitizeInput,
  (req, res, next) => {
    // Ensure at least one of email or phone is provided
    const input = req.body.email || req.body.phone;
    if (!input) {
      return res.status(400).json({ error: "Thiếu email hoặc số điện thoại" });
    }
    req.body.emailOrPhone = input;
    next();
  }, 
  authController.sendOTP
);

router.post('/verify-otp', 
  otpLimiter,
  sanitizeInput,
  validate(otpSchema),
  authController.verifyOTP
);

// Đăng kí, đăng nhập, đăng xuất
router.post(
  "/register",
  authLimiter,
  sanitizeInput,
  validate(registerSchema),
  authController.register
);

router.post("/login", 
  authLimiter,
  sanitizeInput,
  validate(loginSchema), 
  authController.login
);

router.post('/logout', 
  verifyToken, 
  authController.logout
);

// Refresh token
router.post('/refresh-token', 
  authLimiter,
  authController.refreshToken
);

router.post('/reset-password',
  authLimiter,
  sanitizeInput,
  authController.resetPassword
);

// Kiểm tra token và lấy thông tin user
router.get('/profile', verifyToken, (req, res) => {
  res.status(200).json({
    message: "Đã xác thực token thành công!",
    user: req.user,
  });
});

// Cập nhật profile
router.put('/profile', 
  verifyToken,
  sanitizeInput,
  (req, res, next) => {
    // Add validation for profile update if needed
    next();
  },
  async (req, res) => {
    try {
      const userId = req.user.id;
      const updateData = req.body;
      
      // Call service to update user profile
      const updatedUser = await authService.updateUserProfile(userId, updateData);
      
      res.status(200).json({
        message: "Cập nhật thông tin thành công!",
        user: updatedUser
      });
    } catch (err) {
      console.error("Update profile error:", err);
      res.status(err.status || 500).json({ 
        error: err.message || "Lỗi khi cập nhật thông tin" 
      });
    }
  }
);

// Change password
router.post('/change-password',
  verifyToken,
  sanitizeInput,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Thiếu mật khẩu hiện tại hoặc mật khẩu mới" });
      }
      
      await authService.changePassword(userId, currentPassword, newPassword);
      
      res.status(200).json({
        message: "Đổi mật khẩu thành công!"
      });
    } catch (err) {
      console.error("Change password error:", err);
      res.status(err.status || 500).json({ 
        error: err.message || "Lỗi khi đổi mật khẩu" 
      });
    }
  }
);

// Social auth routes (OAuth)
router.get('/google', (req, res) => {
  // Redirect to Google OAuth
  const googleAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI)}&scope=email profile&response_type=code`;
  res.redirect(googleAuthURL);
});

router.get('/facebook', (req, res) => {
  // Redirect to Facebook OAuth
  const facebookAuthURL = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(process.env.FACEBOOK_REDIRECT_URI)}&scope=email,public_profile&response_type=code`;
  res.redirect(facebookAuthURL);
});

router.get('/apple', (req, res) => {
  // Redirect to Apple OAuth
  const appleAuthURL = `https://appleid.apple.com/auth/authorize?client_id=${process.env.APPLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.APPLE_REDIRECT_URI)}&scope=name email&response_type=code&response_mode=form_post`;
  res.redirect(appleAuthURL);
});

// Social auth callbacks
router.get('/google/callback', authController.googleCallback);
router.get('/facebook/callback', authController.facebookCallback);
router.post('/apple/callback', authController.appleCallback);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Auth route error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Đã xảy ra lỗi trong quá trình xác thực'
  });
});

module.exports = router;