const express = require('express');
const productRoutes = require('./product.routes');
const orderRoutes = require('./order.routes');

const router = express.Router();

router.use('/products', productRoutes);
router.use('/orders', orderRoutes);

module.exports = router;