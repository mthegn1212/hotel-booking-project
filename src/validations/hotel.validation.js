const Joi = require("joi");

// Tạo khách sạn
const createHotelSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Tên khách sạn không được để trống",
    "any.required": "Tên khách sạn là bắt buộc",
  }),
  location: Joi.string().required().messages({
    "string.empty": "Vị trí không được để trống",
    "any.required": "Vị trí là bắt buộc",
  }),
  description: Joi.string().allow(""),
  amenities: Joi.array().items(Joi.string()).default([]),
  rating: Joi.number().min(0).max(5).optional(),
  price: Joi.number().min(0).required().messages({
    "number.base": "Giá phải là số",
    "any.required": "Giá khách sạn là bắt buộc",
  }),
});

// Cập nhật khách sạn
const updateHotelSchema = Joi.object({
  name: Joi.string().optional(),
  location: Joi.string().optional(),
  description: Joi.string().allow(""),
  amenities: Joi.array().items(Joi.string()),
  rating: Joi.number().min(0).max(5),
  price: Joi.number().min(0),
}).min(1); // cần ít nhất 1 trường để cập nhật

// Tìm theo tên/city
const searchByNameSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Tên khách sạn không được để trống",
  }),
});

const searchByCitySchema = Joi.object({
  city: Joi.string().required().messages({
    "string.empty": "Thành phố không được để trống",
  }),
});

module.exports = {
  createHotelSchema,
  updateHotelSchema,
  searchByNameSchema,
  searchByCitySchema,
};