const { db } = require('../../config/firebase.config.js');

// GET all categories
exports.getAllCategories = async (req, res) => {
  try {
    const snapshot = await db.collection('categories').orderBy('name').get();
    if (snapshot.empty) {
      return res.status(200).json({ data: [] });
    }
    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ data: categories });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories.', error: error.message });
  }
};

// POST a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Category name is required." });
    }
    const newCategory = { name, description: description || '' };
    const docRef = await db.collection('categories').add(newCategory);
    res.status(201).json({ data: { id: docRef.id, ...newCategory } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create category.', error: error.message });
  }
};

// PUT (update) a category
exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Category name is required." });
    }
    const docRef = db.collection('categories').doc(categoryId);
    await docRef.update({ name, description });
    res.status(200).json({ message: `Category ${categoryId} updated successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update category.', error: error.message });
  }
};

// DELETE a category
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    await db.collection('categories').doc(categoryId).delete();
    res.status(200).json({ message: `Category ${categoryId} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category.', error: error.message });
  }
};