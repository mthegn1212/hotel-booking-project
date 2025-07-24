const userService = require("../../services/user.service");
const User = require("../../models/user.model"); 

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

exports.deleteUser = async (req, res) => {
  try {
    const result = await userService.softDeleteUser(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "Không tìm thấy người dùng" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server" });
  }
};