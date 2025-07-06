const express = require("express");
const router = express.Router();
const reviewController = require("../../../controllers/reviews/review.controller");
const verifyToken = require("../../../middlewares/auth/verifyToken");

router.post("/", verifyToken, reviewController.createReview);
router.get("/hotel/:hotel_id", reviewController.getReviewsByHotel);
router.get("/hotel/:hotel_id/average", reviewController.getHotelRatingAverage);
router.put("/:review_id", verifyToken, reviewController.updateReview);
router.delete("/:review_id", verifyToken, reviewController.deleteReview);

module.exports = router;
