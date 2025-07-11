const http = require("http");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const app = require("./app");
const { initSocket } = require("./socket");

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`🔥 Server is running on http://localhost:${PORT}`);
});