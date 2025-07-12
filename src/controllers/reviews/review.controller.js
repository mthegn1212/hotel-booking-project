const reviewService = require("../../services/review.service");

exports.createReview = async (req, res) => {
  try {
    const { hotel_id, rating, comment } = req.body;
    const user_id = req.user.id;
    const review = await reviewService.createReview(user_id, hotel_id, rating, comment);
    res.status(201).json({ message: "Đã tạo đánh giá", review });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getReviewsByHotel = async (req, res) => {
  try {
    const { hotel_id } = req.params;
    const reviews = await reviewService.getReviewsByHotel(hotel_id);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { review_id } = req.params;
    const { rating, comment } = req.body;
    const updatedReview = await reviewService.updateReview(review_id, req.user.id, rating, comment);
    res.json({ message: "Đã cập nhật đánh giá", review: updatedReview });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { review_id } = req.params;
    const result = await reviewService.deleteReview(review_id, req.user.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getHotelRatingAverage = async (req, res) => {
  try {
    const { hotel_id } = req.params;
    const data = await reviewService.getHotelRatingAverage(hotel_id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};