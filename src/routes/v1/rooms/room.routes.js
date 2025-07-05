const express = require("express");
const router = express.Router();
const roomController = require("../../../controllers/rooms/room.controller");
const verifyToken = require("../../../middlewares/auth/verifyToken");

router.get("/", roomController.getAllRooms);
router.get("/:id", roomController.getRoomById);

router.post("/", verifyToken, roomController.createRoom);
router.put("/:id", verifyToken, roomController.updateRoom);
router.delete("/:id", verifyToken, roomController.deleteRoom);

module.exports = router;