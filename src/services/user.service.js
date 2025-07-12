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