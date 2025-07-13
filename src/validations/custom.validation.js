const Joi = require("joi");

// Định nghĩa custom validator kiểm tra ObjectId
const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message("ID không hợp lệ");

module.exports = {
  objectId,
};