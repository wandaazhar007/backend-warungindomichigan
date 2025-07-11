const express = require('express');
const productRoutes = require('./product.routes');
const orderRoutes = require('./order.routes');
const customerRoutes = require('./customer.routes'); // Assuming customerRoutes is defined in customer.routes.js
const contactRoutes = require('./contact.routes');

const router = express.Router();

router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/customers', customerRoutes); // Assuming customerRoutes is defined in customer.routes.js
router.use('/contact', contactRoutes);

module.exports = router;