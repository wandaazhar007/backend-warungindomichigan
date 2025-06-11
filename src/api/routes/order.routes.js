const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

// POST /api/orders - Create a new order
router.post('/', orderController.createOrder);

module.exports = router;