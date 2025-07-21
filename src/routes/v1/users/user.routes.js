const express = require('express');
const router = express.Router();
const verifyToken = require('../../../middlewares/auth/verifyToken');
const checkRole = require('../../../middlewares/auth/checkRole');
const userController = require("../../../controllers/users/user.controller");
const userValidation = require("../../../validations/user.validation");

router.get('/admin/users', verifyToken, checkRole('admin'), (req, res) => {
  res.json({
    message: 'Chào admin, đây là danh sách người dùng (tạm thời trả text thôi)',
  });
});

router.get("/bookings", verifyToken, userController.getMyBookings);
router.get("/reviews", verifyToken, userController.getMyReviews);
router.get("/me", verifyToken, userController.getCurrentUser);

module.exports = router;