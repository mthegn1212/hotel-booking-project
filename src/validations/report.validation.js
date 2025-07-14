const Joi = require("joi");
const { objectId } = require("./custom.validation");

const createReportSchema = Joi.object({
  subject: Joi.string().min(5).max(100).required(),
  content: Joi.string().min(10).required(),
  related_user_id: objectId.required(), // nếu có liên quan đến người dùng khác
});

const reportIdSchema = Joi.object({
  id: objectId.required(),
});

module.exports = {
  createReportSchema,
  reportIdSchema,
};