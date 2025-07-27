const hotelService = require("../../services/hotel.service");
const Room = require("../../models/room.model");
const Hotel = require("../../models/hotel.model");

exports.getAllHotels = async (req, res) => {
  try {
    const hotels = await hotelService.getAllHotelsWithMinPrice();
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách khách sạn", error });
  }
};

exports.getHotelById = async (req, res) => {
  const hotel = await hotelService.getHotelById(req.params.id);
  if (!hotel) return res.status(404).json({ message: "Hotel not found" });
  res.json(hotel);
};

exports.createHotel = async (req, res) => {
  const newHotel = await hotelService.createHotel(req.body, req.user.id);
  res.status(201).json(newHotel);
};

exports.updateHotel = async (req, res) => {
  try {
    const updatedHotel = await hotelService.updateHotel(req.params.id, req.body, req.user.id);
    res.json(updatedHotel);
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};

exports.deleteHotel = async (req, res) => {
  try {
    const result = await hotelService.deleteHotel(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};

exports.getHotelsByOwner = async (req, res) => {
  const hotels = await hotelService.getHotelsByOwner(req.user.id);
  res.json(hotels);
};

exports.getHotelByName = async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ message: "Tên khách sạn không được để trống" });

  const hotels = await hotelService.getHotelsByName(name);
  if (hotels.length === 0) return res.status(404).json({ message: "Không tìm thấy khách sạn" });

  res.json(hotels);
};

exports.getHotelsByCity = async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ message: "Tên thành phố không được để trống" });

  const hotels = await hotelService.getHotelsByCity(city);
  if (hotels.length === 0) return res.status(404).json({ message: "Không tìm thấy khách sạn" });

  res.json(hotels);
};

exports.getHotelsWithMinRoomPrice = async (req, res) => {
  try {
    const hotels = await Hotel.find({ is_published: true });

    const results = await Promise.all(
      hotels.map(async (hotel) => {
        const cheapestRoom = await Room.findOne({ hotel_id: hotel._id })
          .sort({ price: 1 })
          .limit(1);

        return {
          _id: hotel._id,
          name: hotel.name,
          location: hotel.location,
          images: hotel.images,
          minRoomPrice: cheapestRoom?.price || null,
        };
      })
    );

    res.json(results.filter((h) => h.minRoomPrice !== null));
  } catch (err) {
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};