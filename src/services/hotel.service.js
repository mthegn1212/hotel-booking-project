const Hotel = require("../models/hotel.model");
const Room = require("../models/room.model");

exports.getAllHotels = async () => {
  return await Hotel.find();
};

exports.getHotelById = async (id) => {
  return await Hotel.findById(id);
};

exports.createHotel = async (hotelData, ownerId) => {
  const newHotel = new Hotel({ ...hotelData, owner_id: ownerId });
  return await newHotel.save();
};

exports.updateHotel = async (id, updatedData, userId) => {
  const hotel = await Hotel.findById(id);
  if (!hotel) throw new Error("Hotel not found");
  if (hotel.owner_id.toString() !== userId)
    throw new Error("Bạn không có quyền sửa khách sạn này");

  Object.assign(hotel, updatedData);
  return await hotel.save();
};

exports.deleteHotel = async (id, userId) => {
  const hotel = await Hotel.findById(id);
  if (!hotel) throw new Error("Hotel not found");
  if (hotel.owner_id.toString() !== userId)
    throw new Error("Bạn không có quyền xoá khách sạn này");

  await hotel.remove();
  return { message: "Đã xoá khách sạn" };
};

exports.getHotelsByOwner = async (ownerId) => {
  return await Hotel.find({ owner_id: ownerId });
};

exports.getHotelsByName = async (name) => {
  return await Hotel.find({ name: new RegExp(name, "i") });
};

exports.getHotelsByCity = async (city) => {
  return await Hotel.find({ city: new RegExp(city, "i") });
};

exports.getAllHotelsWithMinPrice = async () => {
  return await Hotel.aggregate([
    {
      $lookup: {
        from: "rooms",
        localField: "_id",
        foreignField: "hotel_id",
        as: "rooms",
      },
    },
    {
      $addFields: {
        minRoomPrice: {
          $cond: [
            { $gt: [{ $size: "$rooms" }, 0] },
            { $min: "$rooms.price" },
            null,
          ],
        },
      },
    },
    {
      $project: {
        name: 1,
        location: 1,
        images: 1,
        minRoomPrice: 1,
      },
    },
  ]);
};
