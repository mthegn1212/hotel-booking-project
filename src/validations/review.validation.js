const Joi = require("joi");

exports.createReviewSchema = Joi.object({
  hotel_id: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().allow("", null),
});

exports.updateReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().allow("", null),
});