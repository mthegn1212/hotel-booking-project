const Review = require("../models/review.model");
const Booking = require("../models/booking.model");
const mongoose = require("mongoose");

exports.createReview = async (userId, hotelId, rating, comment) => {
  const booked = await Booking.findOne({ user_id: userId, status: "confirmed" }).populate("room_id");
  if (!booked || booked.room_id.hotel_id.toString() !== hotelId) {
    throw new Error("Bạn chưa từng đặt phòng ở khách sạn này.");
  }

  const exists = await Review.findOne({ user_id: userId, hotel_id: hotelId });
  if (exists) {
    throw new Error("Bạn đã đánh giá khách sạn này rồi.");
  }

  return await Review.create({ user_id: userId, hotel_id: hotelId, rating, comment });
};

exports.getReviewsByHotel = async (hotelId) => {
  return await Review.find({ hotel_id: hotelId }).populate("user_id", "name");
};

exports.updateReview = async (reviewId, userId, rating, comment) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new Error("Không tìm thấy đánh giá");
  if (review.user_id.toString() !== userId) throw new Error("Không được sửa đánh giá người khác");

  review.rating = rating;
  review.comment = comment;
  return await review.save();
};

exports.deleteReview = async (reviewId, userId) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new Error("Không tìm thấy đánh giá");
  if (review.user_id.toString() !== userId) throw new Error("Không được xoá đánh giá người khác");

  await review.remove();
  return { message: "Đã xoá đánh giá" };
};

exports.getHotelRatingAverage = async (hotelId) => {
  const data = await Review.aggregate([
    { $match: { hotel_id: new mongoose.Types.ObjectId(hotelId) } },
    {
      $group: {
        _id: "$hotel_id",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);
  return data[0] || { averageRating: 0, totalReviews: 0 };
};