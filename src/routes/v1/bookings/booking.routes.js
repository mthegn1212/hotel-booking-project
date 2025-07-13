const express = require('express');
const router = express.Router();
const bookingController = require('../../../controllers/bookings/booking.controller');
const verifyToken = require('../../../middlewares/auth/verifyToken');
const validate = require("../../../middlewares/validate");
const bookingValidation = require("../../../validations/booking.validation");

router.post("/", verifyToken, validate(bookingValidation.createBookingSchema), bookingController.createBooking);
router.get('/my', verifyToken, bookingController.getMyBookings);
router.delete('/:id', verifyToken, bookingController.cancelBooking);
router.patch("/:id/pay", verifyToken, validate(bookingValidation.payBookingSchema), bookingController.payBooking);

module.exports = router;