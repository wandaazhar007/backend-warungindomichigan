const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Protect all category routes
router.use(verifyToken, isAdmin);

router.route('/')
  .get(categoryController.getAllCategories)
  .post(categoryController.createCategory);

router.route('/:categoryId')
  .put(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

module.exports = router;