const Joi = require("joi");

// Tạo booking
const createBookingSchema = Joi.object({
  room_id: Joi.string().required().messages({
    "any.required": "Vui lòng chọn phòng.",
    "string.empty": "room_id không được để trống",
  }),
  start_date: Joi.date().iso().required().messages({
    "any.required": "Vui lòng chọn ngày bắt đầu.",
    "date.base": "Ngày bắt đầu không hợp lệ",
  }),
  end_date: Joi.date().iso().required().messages({
    "any.required": "Vui lòng chọn ngày kết thúc.",
    "date.base": "Ngày kết thúc không hợp lệ",
  }),
});

// Thanh toán booking
const payBookingSchema = Joi.object({
  paymentMethod: Joi.string()
    .valid("momo", "paypal", "cod")
    .required()
    .messages({
      "any.only": "Phương thức thanh toán không hợp lệ",
      "any.required": "Vui lòng chọn phương thức thanh toán",
    }),
});

module.exports = {
  createBookingSchema,
  payBookingSchema,
};