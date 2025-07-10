const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const router = express.Router();

const authDoc = YAML.load(path.join(__dirname, 'auth.yaml'));
const roomDoc = YAML.load(path.join(__dirname, 'room.yaml'));
const bookingDoc = YAML.load(path.join(__dirname, 'booking.yaml'));
const hotelDoc = YAML.load(path.join(__dirname, 'hotel.yaml'));
const reviewDoc = YAML.load(path.join(__dirname, 'review.yaml'));
const ownerRequestDoc = YAML.load(path.join(__dirname, 'ownerRequest.yaml'));
const userDoc = YAML.load(path.join(__dirname, 'user.yaml'));
const uploadDoc = YAML.load(path.join(__dirname, 'upload.yaml'));

// Gộp tất cả lại thành 1 API spec
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Hotel Booking API',
    version: '1.0.0',
    description: 'Tài liệu API cho hệ thống đặt phòng khách sạn',
  },
  servers: [{ url: 'http://localhost:5000' }],
  paths: {
    ...authDoc.paths,
    ...roomDoc.paths,
    ...bookingDoc.paths,
    ...hotelDoc.paths,
    ...reviewDoc.paths,
    ...ownerRequestDoc.paths,
    ...userDoc.paths,
    ...uploadDoc.paths,
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = router;