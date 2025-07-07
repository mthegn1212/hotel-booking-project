const Room = require("../../models/room.model");
const Hotel = require("../../models/hotel.model");

exports.createRoom = async (req, res) => {
  try {
    const { hotel_id, name, price, max_guests, amenities, images } = req.body;

    const hotel = await Hotel.findById(hotel_id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    if (hotel.owner_id.toString() !== req.user.id)
      return res.status(403).json({ message: "You do not own this hotel" });

    const room = await Room.create({
      hotel_id,
      name,
      price,
      max_guests,
      amenities,
      images,
    });

    res.status(201).json({ message: "Room created", room });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllRooms = async (req, res) => {
  const rooms = await Room.find().populate("hotel_id", "name location");
  res.json(rooms);
};

exports.getRoomById = async (req, res) => {
  const room = await Room.findById(req.params.id).populate("hotel_id", "name");
  if (!room) return res.status(404).json({ message: "Room not found" });
  res.json(room);
};

exports.updateRoom = async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) return res.status(404).json({ message: "Room not found" });

  const hotel = await Hotel.findById(room.hotel_id);
  if (hotel.owner_id.toString() !== req.user.id)
    return res.status(403).json({ message: "Unauthorized" });

  Object.assign(room, req.body);
  await room.save();

  res.json({ message: "Room updated", room });
};

exports.deleteRoom = async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) return res.status(404).json({ message: "Room not found" });

  const hotel = await Hotel.findById(room.hotel_id);
  if (hotel.owner_id.toString() !== req.user.id)
    return res.status(403).json({ message: "Unauthorized" });

  await room.remove();
  res.json({ message: "Room deleted" });
};

exports.searchRooms = async (req, res) => {
  try {
    const { location, priceMin, priceMax, amenities } = req.query;

    const hotels = await Hotel.find(
      location ? { location: { $regex: location, $options: 'i' } } : {}
    ).select('_id');

    const hotelIds = hotels.map(h => h._id);

    const query = {
      hotel_id: { $in: hotelIds },
      ...(priceMin && { price: { $gte: +priceMin } }),
      ...(priceMax && { price: { ...((priceMin && { $gte: +priceMin }) || {}), $lte: +priceMax } }),
      ...(amenities && { amenities: { $all: amenities.split(',') } }),
    };

    const rooms = await Room.find(query).populate('hotel_id', 'name location');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};