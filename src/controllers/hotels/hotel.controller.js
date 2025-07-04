const Hotel = require("../../models/hotel.model");

exports.getAllHotels = async (req, res) => {
  const hotels = await Hotel.find();
  res.json(hotels);
};

exports.getHotelById = async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) return res.status(404).json({ message: "Hotel not found" });
  res.json(hotel);
};

exports.createHotel = async (req, res) => {
  const ownerId = req.user.id;
  const newHotel = new Hotel({ ...req.body, owner_id: ownerId });
  await newHotel.save();
  res.status(201).json(newHotel);
};

exports.updateHotel = async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) return res.status(404).json({ message: "Hotel not found" });
  if (hotel.owner_id.toString() !== req.user.id)
    return res.status(403).json({ message: "Bạn không có quyền sửa khách sạn này" });

  Object.assign(hotel, req.body);
  await hotel.save();
  res.json(hotel);
};

exports.deleteHotel = async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) return res.status(404).json({ message: "Hotel not found" });
  if (hotel.owner_id.toString() !== req.user.id)
    return res.status(403).json({ message: "Bạn không có quyền xoá khách sạn này" });

  await hotel.remove();
  res.json({ message: "Đã xoá khách sạn" });
};

exports.getHotelsByOwner = async (req, res) => {
  const ownerId = req.user.id;
  const hotels = await Hotel.find({ owner_id: ownerId });
  res.json(hotels);
};

exports.getHotelByName = async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ message: "Tên khách sạn không được để trống" });

  const hotels = await Hotel.find({ name: new RegExp(name, "i") });
  if (hotels.length === 0) return res.status(404).json({ message: "Không tìm thấy khách sạn" });

  res.json(hotels);
};

exports.getHotelsByCity = async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ message: "Tên thành phố không được để trống" });

  const hotels = await Hotel.find({ city: new RegExp(city, "i") });
  if (hotels.length === 0) return res.status(404).json({ message: "Không tìm thấy khách sạn" });

  res.json(hotels);
};

exports.getHotelsByRating = async (req, res) => {
  const { rating } = req.query;
  if (!rating) return res.status(400).json({ message: "Đánh giá không được để trống" });

  const hotels = await Hotel.find({ rating: { $gte: parseFloat(rating) } });
  if (hotels.length === 0) return res.status(404).json({ message: "Không tìm thấy khách sạn" });

  res.json(hotels);
};

exports.getHotelsByPriceRange = async (req, res) => {
  const { minPrice, maxPrice } = req.query;
  if (!minPrice || !maxPrice)
    return res.status(400).json({ message: "Khoảng giá không được để trống" });

  const hotels = await Hotel.find({
    price: { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) },
  });
  if (hotels.length === 0) return res.status(404).json({ message: "Không tìm thấy khách sạn" });

  res.json(hotels);
};

exports.getHotelsByAmenities = async (req, res) => {
  const { amenities } = req.query;
  if (!amenities) return res.status(400).json({ message: "Tiện nghi không được để trống" });

  const amenitiesArray = amenities.split(",");
  const hotels = await Hotel.find({ amenities: { $all: amenitiesArray } });
  if (hotels.length === 0) return res.status(404).json({ message: "Không tìm thấy khách sạn" });

  res.json(hotels);
};

exports.getHotelsByDateRange = async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate)
    return res.status(400).json({ message: "Khoảng thời gian không được để trống" });

  const hotels = await Hotel.find({
    available_dates: { $elemMatch: { $gte: new Date(startDate), $lte: new Date(endDate) } },
  });
  if (hotels.length === 0) return res.status(404).json({ message: "Không tìm thấy khách sạn" });

  res.json(hotels);
};

