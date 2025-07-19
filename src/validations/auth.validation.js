const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().pattern(/^[0-9]{10,11}$/).required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
  }),
});

const loginSchema = Joi.object({
  identifier: Joi.string().required(), // phone hoặc email
  password: Joi.string().required(),
});

const otpSchema = Joi.object({
  phone: Joi.string().pattern(/^[0-9]{10,11}$/).required(),
  otp: Joi.string().length(6).required(),
});

const phoneSchema = Joi.object({
  phone: Joi.string().pattern(/^[0-9]{10,11}$/).required(),
});

const emailSchema = Joi.object({
  email: Joi.string().email().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  otpSchema,
  phoneSchema,
  emailSchema,
};