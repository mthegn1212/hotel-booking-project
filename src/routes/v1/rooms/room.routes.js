const express = require("express");
const router = express.Router();
const roomController = require("../../../controllers/rooms/room.controller");
const verifyToken = require("../../../middlewares/auth/verifyToken");
const checkRole = require("../../../middlewares/auth/checkRole");
const validate = require("../../../middlewares/validate/validate");
const roomValidation = require("../../../validations/room.validation");

// Tạo phòng mới
router.post(
  "/",
  verifyToken,
  checkRole("owner"),
  validate(roomValidation.createRoomSchema),
  roomController.createRoom
);

// Lấy danh sách phòng
router.get("/", roomController.getAllRooms);

// Tìm kiếm
router.get("/search", validate(roomValidation.searchRoomsSchema, "query"), roomController.searchRooms);

// Kiểm tra phòng trống
router.get("/availability/:id", roomController.checkAvailability);

// Lấy theo ID
router.get("/:id", roomController.getRoomById);

// Cập nhật
router.put(
  "/:id",
  verifyToken,
  checkRole("owner"),
  validate(roomValidation.updateRoomSchema),
  roomController.updateRoom
);

// Xoá
router.delete(
  "/:id",
  verifyToken,
  checkRole("owner"),
  roomController.deleteRoom
);

module.exports = router;