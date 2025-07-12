const userService = require("../../services/user.service");

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await userService.getMyBookings(req.user.id);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await userService.getMyReviews(req.user.id);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};