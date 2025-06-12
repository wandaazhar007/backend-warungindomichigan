const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// GET routes are public - anyone can see products
router.get('/', productController.getAllProducts);
router.get('/:productId', productController.getProductById);

// POST, PUT, DELETE routes are protected and require an admin
router.post('/', verifyToken, isAdmin, productController.createProduct);
router.put('/:productId', verifyToken, isAdmin, productController.updateProduct);
router.delete('/:productId', verifyToken, isAdmin, productController.deleteProduct);

module.exports = router;