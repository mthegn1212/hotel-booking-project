const express = require("express");
const router = express.Router();
const hotelController = require("../../../controllers/hotels/hotel.controller");
const verifyToken = require("../../../middlewares/auth/verifyToken");
const checkRole = require("../../../middlewares/auth/checkRole");
const validate = require("../../../middlewares/validate/validate");
const hotelValidation = require("../../../validations/hotel.validation");

// Public routes
router.get("/search/name", validate(hotelValidation.searchByNameSchema, "query"), hotelController.getHotelByName);
router.get("/search/city", validate(hotelValidation.searchByCitySchema, "query"), hotelController.getHotelsByCity);
router.get("/", hotelController.getAllHotels);
router.get("/:id", hotelController.getHotelById);
router.get("/with-min-room-price", hotelController.getHotelsWithMinRoomPrice);

// Owner-only routes
router.post("/", 
  verifyToken, 
  checkRole("owner"), 
  validate(hotelValidation.createHotelSchema), 
  hotelController.createHotel
);

router.put("/:id", 
  verifyToken, 
  checkRole("owner"), 
  validate(hotelValidation.updateHotelSchema), 
  hotelController.updateHotel
);

router.delete("/:id", 
  verifyToken, 
  checkRole("owner"), 
  hotelController.deleteHotel
);

// Get hotels by owner
router.get("/owner/my-hotels", 
  verifyToken, 
  checkRole("owner"), 
  hotelController.getHotelsByOwner
);

module.exports = router;