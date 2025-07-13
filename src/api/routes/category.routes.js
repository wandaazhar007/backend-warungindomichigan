const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// --- PUBLIC ROUTE ---
// Anyone can view the list of all categories
router.get('/', categoryController.getAllCategories);

// --- PROTECTED ADMIN ROUTES ---
// Only an admin can create, update, or delete categories
router.post('/', verifyToken, isAdmin, categoryController.createCategory);

router.put('/:categoryId', verifyToken, isAdmin, categoryController.updateCategory);

router.delete('/:categoryId', verifyToken, isAdmin, categoryController.deleteCategory);


module.exports = router;