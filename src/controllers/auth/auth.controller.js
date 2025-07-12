const authService = require("../../services/auth.service");

// Đăng ký
exports.register = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json({ message: result });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const data = await authService.loginUser(req.body);
    res.status(200).json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// Đăng xuất
exports.logout = async (req, res) => {
  try {
    res.status(200).json({
      message: "Đăng xuất thành công. Vui lòng xoá token phía client!",
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi trong quá trình logout!" });
  }
};