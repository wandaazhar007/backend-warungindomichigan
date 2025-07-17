const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shipping.controller');

// This endpoint can be public as it doesn't expose sensitive user data
router.post('/calculate', shippingController.calculateShipping);

module.exports = router;