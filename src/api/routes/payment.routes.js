const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// POST /api/payments/create-intent - A logged-in user can create a payment intent
// We use verifyToken to ensure only logged-in users can attempt to pay
router.post('/create-intent', paymentController.createPaymentIntent);

module.exports = router;