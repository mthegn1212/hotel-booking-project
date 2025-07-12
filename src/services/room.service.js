const Room = require("../models/room.model");
const Hotel = require("../models/hotel.model");
const Booking = require("../models/booking.model");

exports.createRoom = async (ownerId, roomData) => {
  const hotel = await Hotel.findById(roomData.hotel_id);
  if (!hotel) throw new Error("Hotel not found");
  if (hotel.owner_id.toString() !== ownerId)
    throw new Error("You do not own this hotel");

  const room = await Room.create(roomData);
  return room;
};

exports.getAllRooms = async () => {
  return await Room.find().populate("hotel_id", "name location");
};

exports.getRoomById = async (roomId) => {
  const room = await Room.findById(roomId).populate("hotel_id", "name");
  if (!room) throw new Error("Room not found");
  return room;
};

exports.updateRoom = async (roomId, ownerId, updateData) => {
  const room = await Room.findById(roomId);
  if (!room) throw new Error("Room not found");

  const hotel = await Hotel.findById(room.hotel_id);
  if (hotel.owner_id.toString() !== ownerId)
    throw new Error("Unauthorized");

  Object.assign(room, updateData);
  await room.save();
  return room;
};

exports.deleteRoom = async (roomId, ownerId) => {
  const room = await Room.findById(roomId);
  if (!room) throw new Error("Room not found");

  const hotel = await Hotel.findById(room.hotel_id);
  if (hotel.owner_id.toString() !== ownerId)
    throw new Error("Unauthorized");

  await room.remove();
  return { message: "Room deleted" };
};

exports.searchRooms = async (query) => {
  const { location, priceMin, priceMax, amenities } = query;

  const hotels = await Hotel.find(
    location ? { location: { $regex: location, $options: "i" } } : {}
  ).select("_id");

  const hotelIds = hotels.map((h) => h._id);

  const searchQuery = {
    hotel_id: { $in: hotelIds },
    ...(priceMin && { price: { $gte: +priceMin } }),
    ...(priceMax && {
      price: {
        ...((priceMin && { $gte: +priceMin }) || {}),
        $lte: +priceMax,
      },
    }),
    ...(amenities && { amenities: { $all: amenities.split(",") } }),
  };

  return await Room.find(searchQuery).populate("hotel_id", "name location");
};

exports.checkAvailability = async (roomId, start_date, end_date) => {
  const start = new Date(start_date);
  const end = new Date(end_date);

  const overlappingBookings = await Booking.find({
    room_id: roomId,
    status: { $ne: "cancelled" },
    $or: [{ start_date: { $lte: end }, end_date: { $gte: start } }],
  });

  return {
    isAvailable: overlappingBookings.length === 0,
    message:
      overlappingBookings.length === 0
        ? "Phòng còn trống trong khoảng thời gian đã chọn"
        : "Phòng đã có người đặt trong khoảng thời gian này",
  };
};