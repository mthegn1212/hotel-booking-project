const Joi = require("joi");

exports.createRoomSchema = Joi.object({
  hotel_id: Joi.string().required(),
  name: Joi.string().required(),
  price: Joi.number().min(0).required(),
  max_guests: Joi.number().min(1).required(),
  amenities: Joi.array().items(Joi.string()).required(),
  images: Joi.array().items(Joi.string().uri()).required(),
});

exports.updateRoomSchema = Joi.object({
  name: Joi.string(),
  price: Joi.number().min(0),
  max_guests: Joi.number().min(1),
  amenities: Joi.array().items(Joi.string()),
  images: Joi.array().items(Joi.string().uri()),
});

exports.searchRoomsSchema = Joi.object({
  location: Joi.string(),
  priceMin: Joi.number().min(0),
  priceMax: Joi.number().min(0),
  amenities: Joi.string(),
});