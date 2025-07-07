const Booking = require('../../models/booking.model');
const Room = require('../../models/room.model');
const Hotel = require('../../models/hotel.model');
const Review = require('../../models/review.model');

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user_id: req.user.id })
      .populate({ path: 'room_id', populate: { path: 'hotel_id', select: 'name location' } });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user_id: req.user.id }).populate('hotel_id', 'name');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};