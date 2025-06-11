const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// GET /api/products - Fetch all products
router.get('/', productController.getAllProducts);

// GET /api/products/:productId - Fetch a single product
router.get('/:productId', productController.getProductById);

// POST /api/products - Create a new product (Admin)
router.post('/', productController.createProduct);

// PUT /api/products/:productId - Update a product (Admin)
router.put('/:productId', productController.updateProduct);

// DELETE /api/products/:productId - Delete a product (Admin)
router.delete('/:productId', productController.deleteProduct);

module.exports = router;