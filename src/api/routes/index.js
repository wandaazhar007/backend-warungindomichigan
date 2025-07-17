const express = require('express');
const productRoutes = require('./product.routes');
const orderRoutes = require('./order.routes');
const customerRoutes = require('./customer.routes');
const contactRoutes = require('./contact.routes');
const categoryRoutes = require('./category.routes');
const shippingRoutes = require('./shipping.routes'); // <-- Temporarily comment this out

const router = express.Router();

router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/customers', customerRoutes);
router.use('/contact', contactRoutes);
router.use('/categories', categoryRoutes);
router.use('/shipping', shippingRoutes); // <-- And comment this out

module.exports = router;