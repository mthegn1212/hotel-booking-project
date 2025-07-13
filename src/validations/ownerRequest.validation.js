const Joi = require("joi");
const { objectId } = require("./custom.validation");

const requestOwnerSchema = Joi.object({
  hotel_name: Joi.string().min(3).max(100).required(),
  location: Joi.string().min(3).max(100).required(),
  identity_number: Joi.string().length(12).required(),
  identity_image: Joi.string().uri().required(),
  hotel_license: Joi.string().uri().required(),
  note: Joi.string().max(500).allow(""),
});

const objectIdSchema = Joi.object({
  id: objectId.required(),
});

module.exports = {
  requestOwnerSchema,
  objectIdSchema,
};