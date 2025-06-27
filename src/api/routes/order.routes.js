const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');


// GET /api/orders - An admin can get all orders
router.get('/', verifyToken, isAdmin, orderController.getAllOrders);
// A regular authenticated user can create an order
router.post('/', verifyToken, orderController.createOrder);

// We can add admin-specific order routes here later, for example:
// router.get('/', verifyToken, isAdmin, orderController.getAllOrders);
// router.get('/:orderId', verifyToken, orderController.getOrderById); // Could be for customer or admin

// GET /api/orders/user/:userId - An admin can get all orders for a specific user
router.get('/user/:userId', verifyToken, isAdmin, orderController.getOrdersByUser);

// PUT /api/orders/:orderId/status - An admin can update an order's status
router.put('/:orderId/status', verifyToken, isAdmin, orderController.updateOrderStatus);

// GET /api/orders/:orderId - An admin can get a single order by its ID
router.get('/:orderId', verifyToken, isAdmin, orderController.getOrderById);

module.exports = router;