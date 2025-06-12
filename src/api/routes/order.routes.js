const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// A regular authenticated user can create an order
router.post('/', verifyToken, orderController.createOrder);

// We can add admin-specific order routes here later, for example:
// router.get('/', verifyToken, isAdmin, orderController.getAllOrders);
// router.get('/:orderId', verifyToken, orderController.getOrderById); // Could be for customer or admin

module.exports = router;