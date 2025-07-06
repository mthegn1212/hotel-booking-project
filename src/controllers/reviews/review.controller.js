const Review = require("../../models/review.model");
const Booking = require("../../models/booking.model");

exports.createReview = async (req, res) => {
  const { hotel_id, rating, comment } = req.body;
  const user_id = req.user.id;

  const booked = await Booking.findOne({ user_id, status: "confirmed" }).populate("room_id");
  if (!booked || booked.room_id.hotel_id.toString() !== hotel_id)
    return res.status(403).json({ message: "Bạn chưa từng đặt phòng ở khách sạn này." });

  const exists = await Review.findOne({ user_id, hotel_id });
  if (exists)
    return res.status(400).json({ message: "Bạn đã đánh giá khách sạn này rồi." });

  const review = await Review.create({ user_id, hotel_id, rating, comment });

  res.status(201).json({ message: "Đã tạo đánh giá", review });
};

exports.getReviewsByHotel = async (req, res) => {
  const { hotel_id } = req.params;
  const reviews = await Review.find({ hotel_id }).populate("user_id", "name");
  res.json(reviews);
};

exports.updateReview = async (req, res) => {
  const { review_id } = req.params;
  const { rating, comment } = req.body;

  const review = await Review.findById(review_id);
  if (!review) return res.status(404).json({ message: "Không tìm thấy đánh giá" });
  if (review.user_id.toString() !== req.user.id)
    return res.status(403).json({ message: "Không được sửa đánh giá người khác" });

  review.rating = rating;
  review.comment = comment;
  await review.save();

  res.json({ message: "Đã cập nhật đánh giá", review });
};

exports.deleteReview = async (req, res) => {
  const { review_id } = req.params;
  const review = await Review.findById(review_id);
  if (!review) return res.status(404).json({ message: "Không tìm thấy đánh giá" });
  if (review.user_id.toString() !== req.user.id)
    return res.status(403).json({ message: "Không được xoá đánh giá người khác" });

  await review.remove();
  res.json({ message: "Đã xoá đánh giá" });
};

exports.getHotelRatingAverage = async (req, res) => {
  const { hotel_id } = req.params;
  const data = await Review.aggregate([
    { $match: { hotel_id: new require("mongoose").Types.ObjectId(hotel_id) } },
    {
      $group: {
        _id: "$hotel_id",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);
  res.json(data[0] || { averageRating: 0, totalReviews: 0 });
};