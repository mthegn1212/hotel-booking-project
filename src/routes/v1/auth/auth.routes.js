const express = require('express');
const router = express.Router();
const authController = require('../../../controllers/auth/auth.controller');
const verifyToken = require('../../../middlewares/auth/verifyToken');
const validate = require("../../../middlewares/validate/validate");
const { registerSchema, loginSchema } = require("../../../validations/auth.validation");


router.post('/check-email', (req, res, next) => {
  req.body.emailOrPhone = req.body.email;
  return authController.checkUser(req, res);
});
router.post('/check-phone', (req, res, next) => {
  req.body.emailOrPhone = req.body.phone;
  return authController.checkUser(req, res);
});
router.post('/send-otp', (req, res, next) => {
  req.body.emailOrPhone = req.body.email ?? req.body.phone;
  next();
}, authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post('/logout', authController.logout);

// Route để test verifyToken
router.get('/profile', verifyToken, (req, res) => {
  res.status(200).json({
    message: "Đã xác thực token thành công!",
    user: req.user,
  });
});

module.exports = router;