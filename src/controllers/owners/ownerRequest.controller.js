const ownerRequestService = require("../../services/ownerRequest.service");

exports.requestOwner = async (req, res) => {
  try {
    const request = await ownerRequestService.requestOwner(req.user.id, req.body);
    res.status(201).json({ message: "Yêu cầu trở thành chủ khách sạn đã được gửi!", request });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await ownerRequestService.getAllRequests();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    await ownerRequestService.approveRequest(req.params.id);
    res.json({ message: "Đã duyệt yêu cầu, user đã thành owner" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    await ownerRequestService.rejectRequest(req.params.id);
    res.json({ message: "Đã từ chối yêu cầu" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getRequestByUser = async (req, res) => {
  try {
    const request = await ownerRequestService.getRequestByUser(req.user.id);
    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.cancelRequest = async (req, res) => {
  try {
    await ownerRequestService.cancelRequest(req.user.id);
    res.json({ message: "Đã huỷ yêu cầu" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const request = await ownerRequestService.getRequestById(req.params.id);
    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};