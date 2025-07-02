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
app.use("/api/v1/auth", require("./routes/v1/auth.routes"));

module.exports = app;