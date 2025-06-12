const { db } = require('../../config/firebase.config.js');

/**
 * Creates a new product in the Firestore database.
 */
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrl, category, stockQuantity, dimensions } = req.body;

    // Basic validation
    if (!name || !price || !category) {
      return res.status(400).json({ message: "Missing required fields: name, price, and category are required." });
    }

    const newProduct = {
      name,
      description: description || '',
      price, // Remember to store this as an integer (cents)
      imageUrl: imageUrl || '',
      category,
      stockQuantity: stockQuantity || 0,
      dimensions: dimensions || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add the new product to the "products" collection
    const docRef = await db.collection('products').add(newProduct);

    res.status(201).json({
      message: 'Product created successfully',
      productId: docRef.id,
      data: newProduct
    });
  } catch (error) {
    console.error("Error creating product: ", error);
    res.status(500).json({ message: 'Failed to create product.', error: error.message });
  }
};

/**
 * Retrieves all products from the database, with optional category filtering.
 */
exports.getAllProducts = async (req, res) => {
  try {
    const { category } = req.query;
    let query = db.collection('products');

    // If a category is provided in the query string, filter by it
    if (category) {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      return res.status(200).json({ message: 'No products found.', data: [] });
    }

    const products = [];
    snapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({ message: 'Products fetched successfully', data: products });
  } catch (error) {
    console.error("Error fetching products: ", error);
    res.status(500).json({ message: 'Failed to fetch products.', error: error.message });
  }
};

/**
 * Retrieves a single product by its ID.
 */
exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const docRef = db.collection('products').doc(productId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product fetched successfully', data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error("Error fetching product by ID: ", error);
    res.status(500).json({ message: 'Failed to fetch product.', error: error.message });
  }
};

/**
 * Updates an existing product.
 */
exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const dataToUpdate = req.body;

    const docRef = db.collection('products').doc(productId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Add the updatedAt timestamp
    dataToUpdate.updatedAt = new Date();

    await docRef.update(dataToUpdate);

    res.status(200).json({ message: `Product with ID ${productId} updated successfully` });
  } catch (error) {
    console.error("Error updating product: ", error);
    res.status(500).json({ message: 'Failed to update product.', error: error.message });
  }
};

/**
 * Deletes a product from the database.
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const docRef = db.collection('products').doc(productId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await docRef.delete();

    res.status(200).json({ message: `Product with ID ${productId} deleted successfully` });
  } catch (error) {
    console.error("Error deleting product: ", error);
    res.status(500).json({ message: 'Failed to delete product.', error: error.message });
  }
};