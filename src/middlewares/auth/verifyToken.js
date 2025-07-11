const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Không có token hoặc token không hợp lệ" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm user từ database để lấy email & role
    const user = await User.findById(decoded.id).select("id email role");

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Gán vào req.user đầy đủ
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    console.error("Lỗi verifyToken:", err);
    return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

module.exports = verifyToken;