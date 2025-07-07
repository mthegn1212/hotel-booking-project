const express = require('express');
const router = express.Router();
const verifyToken = require('../../../middlewares/auth/verifyToken');
const checkRole = require('../../../middlewares/auth/checkRole');
const { getMyBookings, getMyReviews } = require('../../../controllers/users/user.controller');

router.get('/admin/users', verifyToken, checkRole('admin'), (req, res) => {
  res.json({
    message: 'Chào admin, đây là danh sách người dùng (tạm thời trả text thôi)',
  });
});
router.get('/me/bookings', verifyToken, getMyBookings);
router.get('/me/reviews', verifyToken, getMyReviews);

module.exports = router;