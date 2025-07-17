const jwt = require("jsonwebtoken");

const generateJWT = (payload, expiresIn = "1d") => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

module.exports = generateJWT;