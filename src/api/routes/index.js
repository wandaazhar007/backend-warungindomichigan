const express = require('express');
const productRoutes = require('./product.routes');
const orderRoutes = require('./order.routes');
const customerRoutes = require('./customer.routes');
const contactRoutes = require('./contact.routes');
const categoryRoutes = require('./category.routes');
const shippingRoutes = require('./shipping.routes');
const paymentRoutes = require('./payment.routes');
const authRoutes = require('./auth.routes');
const profileRoutes = require('./profile.routes');

const router = express.Router();

router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/customers', customerRoutes);
router.use('/contact', contactRoutes);
router.use('/categories', categoryRoutes);
router.use('/shipping', shippingRoutes);
router.use('/payments', paymentRoutes);
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);

module.exports = router;