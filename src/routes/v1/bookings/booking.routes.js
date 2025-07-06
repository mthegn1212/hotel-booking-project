const express = require('express');
const router = express.Router();
const bookingController = require('../../../controllers/bookings/booking.controller');
const verifyToken = require('../../../middlewares/auth/verifyToken');

router.post('/', verifyToken, bookingController.createBooking);
router.get('/my', verifyToken, bookingController.getMyBookings);
router.delete('/:id', verifyToken, bookingController.cancelBooking);

module.exports = router;