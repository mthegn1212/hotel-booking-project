const OwnerRequest = require("../../models/ownerRequest.model");
const User = require("../../models/user.model");

// Gửi yêu cầu trở thành chủ khách sạn
exports.requestOwner = async (req, res) => {
  const {
    hotel_name,
    location,
    identity_number,
    identity_image,
    hotel_license,
    note,
  } = req.body;

  try {
    const existing = await OwnerRequest.findOne({ user_id: req.user.id });
    const existsID = await OwnerRequest.findOne({ identity_number });

    if (existsID)
      return res.status(400).json({ message: "CMND/CCCD này đã được sử dụng!" });

    if (existing)
      return res.status(400).json({ message: "Bạn đã gửi yêu cầu rồi!" });

    const newReq = await OwnerRequest.create({
      user_id: req.user.id,
      hotel_name,
      location,
      identity_number,
      identity_image,
      hotel_license,
      note,
    });

    res.status(201).json({
      message: "Yêu cầu trở thành chủ khách sạn đã được gửi!",
      request: newReq,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Đã xảy ra lỗi server" });
  }
};

// Admin xem tất cả yêu cầu
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await OwnerRequest.find().populate("user_id", "name email role");
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Đã xảy ra lỗi server" });
  }
};

// Admin duyệt yêu cầu
exports.approveRequest = async (req, res) => {
  try {
    const reqId = req.params.id;
    const request = await OwnerRequest.findById(reqId);
    if (!request)
      return res.status(404).json({ message: "Không tìm thấy yêu cầu" });

    const user = await User.findById(request.user_id);
    user.role = "owner";
    await user.save();

    request.status = "approved";
    await request.save();

    res.json({ message: "Đã duyệt yêu cầu, user đã thành owner" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Đã xảy ra lỗi server" });
  }
};

// Admin từ chối yêu cầu
exports.rejectRequest = async (req, res) => {
  try {
    const reqId = req.params.id;
    const request = await OwnerRequest.findById(reqId);
    if (!request)
      return res.status(404).json({ message: "Không tìm thấy yêu cầu" });

    request.status = "rejected";
    await request.save();

    res.json({ message: "Đã từ chối yêu cầu" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Đã xảy ra lỗi server" });
  }
};

// Người dùng xem yêu cầu của mình
exports.getRequestByUser = async (req, res) => {
  try {
    const request = await OwnerRequest.findOne({ user_id: req.user.id });
    if (!request)
      return res.status(404).json({ message: "Bạn chưa gửi yêu cầu nào" });

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Đã xảy ra lỗi server" });
  }
};

// Người dùng huỷ yêu cầu
exports.cancelRequest = async (req, res) => {
  try {
    const request = await OwnerRequest.findOne({ user_id: req.user.id });

    if (!request)
      return res.status(404).json({ message: "Bạn chưa gửi yêu cầu nào" });

    if (request.status === "approved")
      return res.status(400).json({ message: "Không thể huỷ yêu cầu đã được duyệt" });

    await request.remove();
    res.json({ message: "Đã huỷ yêu cầu" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Đã xảy ra lỗi server" });
  }
};

// Admin lấy yêu cầu theo ID
exports.getRequestById = async (req, res) => {
  try {
    const reqId = req.params.id;
    const request = await OwnerRequest.findById(reqId).populate("user_id", "name email role");
    if (!request)
      return res.status(404).json({ message: "Không tìm thấy yêu cầu" });

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Đã xảy ra lỗi server" });
  }
};