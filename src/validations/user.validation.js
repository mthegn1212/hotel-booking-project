const Joi = require("joi");

const getMyBookingsSchema = Joi.object({});
const getMyReviewsSchema = Joi.object({});

const filterBookingsSchema = Joi.object({
  status: Joi.string().valid("confirmed", "cancelled", "pending"),
});

module.exports = {
  getMyBookingsSchema,
  getMyReviewsSchema,
  filterBookingsSchema,
};