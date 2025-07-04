const express = require("express");
const router = express.Router();
const hotelController = require("../../../controllers/hotels/hotel.controller");
const verifyToken = require("../../../middlewares/auth/verifyToken");
const checkRole = require("../../../middlewares/auth/checkRole");

// Public
router.get("/", hotelController.getAllHotels);
router.get("/:id", hotelController.getHotelById);

// Owner only
router.post("/", verifyToken, checkRole("owner"), hotelController.createHotel);
router.put("/:id", verifyToken, checkRole("owner"), hotelController.updateHotel);
router.delete("/:id", verifyToken, checkRole("owner"), hotelController.deleteHotel);

module.exports = router;