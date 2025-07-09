const express = require('express');
const router = express.Router();
const upload = require('../../../middlewares/upload/upload.middleware');
const verifyToken = require('../../../middlewares/auth/verifyToken');

router.post('/', verifyToken, upload.array('images', 5), (req, res) => {
  const urls = req.files.map(file => file.path);
  res.status(200).json({ message: 'Upload thành công', urls });
});

module.exports = router;