const express = require('express');
const router = express.Router();
const authController = require('../../../controllers/auth/auth.controller');
const verifyToken = require('../../../middlewares/auth/verifyToken');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Route để test verifyToken
router.get('/profile', verifyToken, (req, res) => {
  res.status(200).json({
    message: "Đã xác thực token thành công!",
    user: req.user,
  });
});

module.exports = router;