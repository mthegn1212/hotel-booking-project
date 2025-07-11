let io;

const initSocket = (server) => {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io chưa được khởi tạo");
  }
  return io;
};

module.exports = { initSocket, getIO };