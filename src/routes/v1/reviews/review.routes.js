const express = require("express");
const router = express.Router();
const reviewController = require("../../../controllers/reviews/review.controller");
const verifyToken = require("../../../middlewares/auth/verifyToken");
const validate = require("../../../middlewares/validate/validate");
const reviewValidation = require("../../../validations/review.validation");

// Người dùng tạo đánh giá
router.post(
  "/",
  verifyToken,
  validate(reviewValidation.createReviewSchema),
  reviewController.createReview
);

// Lấy đánh giá theo khách sạn
router.get("/hotel/:hotel_id", reviewController.getReviewsByHotel);

// Cập nhật đánh giá
router.put(
  "/:review_id",
  verifyToken,
  validate(reviewValidation.updateReviewSchema),
  reviewController.updateReview
);

// Xoá đánh giá
router.delete("/:review_id", verifyToken, reviewController.deleteReview);

// Lấy rating trung bình theo hotel
router.get("/average/:hotel_id", reviewController.getHotelRatingAverage);

module.exports = router;