const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Kiểm tra server
app.get('/healthcheck', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is alive' });
});

// Các route chính
app.use("/api/v1/auth", require("./routes/v1/auth/auth.routes"));
app.use("/api/v1/users", require("./routes/v1/users/user.routes"));
app.use("/api/v1/hotels", require("./routes/v1/hotels/hotel.routes"));
app.use("/api/v1/owners", require("./routes/v1/owners/ownerRequest.routes"));

module.exports = app;