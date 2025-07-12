const roomService = require("../../services/room.service");

exports.createRoom = async (req, res) => {
  try {
    const room = await roomService.createRoom(req.user.id, req.body);
    res.status(201).json({ message: "Room created", room });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await roomService.getAllRooms();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await roomService.getRoomById(req.params.id);
    res.json(room);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const room = await roomService.updateRoom(req.params.id, req.user.id, req.body);
    res.json({ message: "Room updated", room });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    await roomService.deleteRoom(req.params.id, req.user.id);
    res.json({ message: "Room deleted" });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

exports.searchRooms = async (req, res) => {
  try {
    const rooms = await roomService.searchRooms(req.query);
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    const result = await roomService.checkAvailability(req.params.id, req.query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};