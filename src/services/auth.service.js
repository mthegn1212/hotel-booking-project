const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Đăng ký người dùng
exports.registerUser = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw { status: 400, message: "Email đã tồn tại!" };

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, password: hashedPassword, role });
  await newUser.save();

  return "Đăng ký thành công!";
};

// Đăng nhập
exports.loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw { status: 404, message: "Người dùng không tồn tại" };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw { status: 400, message: "Sai mật khẩu" };

  const token = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};