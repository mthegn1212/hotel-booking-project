const OwnerRequest = require("../models/ownerRequest.model");
const User = require("../models/user.model");

exports.requestOwner = async (user_id, data) => {
  const existing = await OwnerRequest.findOne({ user_id });
  const existsID = await OwnerRequest.findOne({ identity_number: data.identity_number });

  if (existsID) throw new Error("CMND/CCCD này đã được sử dụng!");
  if (existing) throw new Error("Bạn đã gửi yêu cầu rồi!");

  return await OwnerRequest.create({ user_id, ...data });
};

exports.getAllRequests = async () => {
  return await OwnerRequest.find().populate("user_id", "name email role");
};

exports.approveRequest = async (reqId) => {
  const request = await OwnerRequest.findById(reqId);
  if (!request) throw new Error("Không tìm thấy yêu cầu");

  const user = await User.findById(request.user_id);
  user.role = "owner";
  await user.save();

  request.status = "approved";
  await request.save();
};

exports.rejectRequest = async (reqId) => {
  const request = await OwnerRequest.findById(reqId);
  if (!request) throw new Error("Không tìm thấy yêu cầu");

  request.status = "rejected";
  await request.save();
};

exports.getRequestByUser = async (user_id) => {
  const request = await OwnerRequest.findOne({ user_id });
  if (!request) throw new Error("Bạn chưa gửi yêu cầu nào");

  return request;
};

exports.cancelRequest = async (user_id) => {
  const request = await OwnerRequest.findOne({ user_id });
  if (!request) throw new Error("Bạn chưa gửi yêu cầu nào");
  if (request.status === "approved")
    throw new Error("Không thể huỷ yêu cầu đã được duyệt");

  await request.remove();
};

exports.getRequestById = async (reqId) => {
  const request = await OwnerRequest.findById(reqId).populate("user_id", "name email role");
  if (!request) throw new Error("Không tìm thấy yêu cầu");

  return request;
};