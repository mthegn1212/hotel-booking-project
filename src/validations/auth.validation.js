const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Tên không được để trống",
    "string.min": "Tên phải có ít nhất 2 ký tự",
    "any.required": "Vui lòng nhập tên",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email không hợp lệ",
    "any.required": "Vui lòng nhập email",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Mật khẩu phải có ít nhất 6 ký tự",
    "any.required": "Vui lòng nhập mật khẩu",
  }),
  role: Joi.string().valid("customer", "owner", "admin").optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email không hợp lệ",
    "any.required": "Vui lòng nhập email",
  }),
  password: Joi.string().required().messages({
    "any.required": "Vui lòng nhập mật khẩu",
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
};