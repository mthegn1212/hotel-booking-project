const Booking = require("../models/booking.model");
const Review = require("../models/review.model");

exports.getMyBookings = async (userId) => {
  return await Booking.find({ user_id: userId }).populate({
    path: "room_id",
    populate: { path: "hotel_id", select: "name location" },
  });
};

exports.getMyReviews = async (userId) => {
  return await Review.find({ user_id: userId }).populate("hotel_id", "name");
};

exports.softDeleteUser = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new Error("User not found");

  user.isDeleted = true;
  await user.save();

  return { message: "User soft-deleted successfully" };
};