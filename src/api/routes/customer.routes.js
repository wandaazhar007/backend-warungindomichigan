const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// GET /api/customers - Fetch all customers (Admin Only)
router.get('/', verifyToken, isAdmin, customerController.getAllCustomers);

module.exports = router;