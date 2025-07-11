const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("🟢 Connected to socket server:", socket.id);
});

socket.on("booking_created", (data) => {
  console.log("🔔 Booking Notification:", data.message);
});

socket.on("disconnect", () => {
  console.log("🔴 Disconnected from server");
});
