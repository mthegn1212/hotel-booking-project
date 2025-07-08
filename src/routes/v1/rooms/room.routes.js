const express = require("express");
const router = express.Router();
const verifyToken = require("../../../middlewares/auth/verifyToken");
const roomController = require("../../../controllers/rooms/room.controller");

router.get("/", roomController.getAllRooms);
router.get('/search', roomController.searchRooms);
router.get('/check-availability/:id', roomController.checkAvailability);
router.get("/:id", roomController.getRoomById);

router.post("/", verifyToken, roomController.createRoom);
router.put("/:id", verifyToken, roomController.updateRoom);
router.delete("/:id", verifyToken, roomController.deleteRoom);

module.exports = router;