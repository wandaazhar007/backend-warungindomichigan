const express = require('express');
const productRoutes = require('./product.routes');
const orderRoutes = require('./order.routes');
const customerRoutes = require('./customer.routes');
const contactRoutes = require('./contact.routes');
const categoryRoutes = require('./category.routes');

const router = express.Router();

router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/customers', customerRoutes);
router.use('/contact', contactRoutes);
router.use('/categories', categoryRoutes);

module.exports = router;