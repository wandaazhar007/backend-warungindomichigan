const { db } = require('../../config/firebase.config.js');

/**
 * Generates searchable keywords and prefixes for a product name.
 * @param {string} name The name of the product.
 * @returns {object} An object containing an array of keywords and an array of prefixes.
 */
const generateSearchableData = (name) => {
  if (!name) return { keywords: [], prefixes: [] };

  const nameInLowerCase = name.toLowerCase();
  const keywords = nameInLowerCase.split(' ').filter(word => word);
  const prefixes = new Set(); // Use a Set to avoid duplicate prefixes

  keywords.forEach(word => {
    for (let i = 1; i <= word.length; i++) {
      prefixes.add(word.substring(0, i));
    }
  });

  return { keywords, prefixes: Array.from(prefixes) };
};

/**
 * Creates a new product, including search keywords and prefixes.
 */
exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;
    const { keywords, prefixes } = generateSearchableData(productData.name);

    const newProduct = {
      ...productData,
      name_keywords: keywords,
      name_search_prefixes: prefixes, // <-- Add prefixes
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection('products').add(newProduct);

    res.status(201).json({
      message: 'Product created successfully',
      data: { id: docRef.id, ...newProduct }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product.', error: error.message });
  }
};

/**
 * Retrieves products using prefix search on keywords.
 */
exports.getAllProducts = async (req, res) => {
  try {
    const { category, lastVisible, searchTerm } = req.query;
    const productsRef = db.collection('products');

    // Start with a base query
    let query = productsRef;

    // --- APPLY FILTERS AND ORDERING ---
    // If a search term is provided, filter by prefixes
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      query = query.where('name_search_prefixes', 'array-contains', lowerCaseSearchTerm);
    }

    // If a category is provided, add that filter
    if (category) {
      query = query.where('category', '==', category);
    }

    // Always order by name for consistent results
    query = query.orderBy('name');

    // Apply pagination limit
    query = query.limit(10);

    if (lastVisible) {
      const lastVisibleDoc = await productsRef.doc(lastVisible).get();
      if (lastVisibleDoc.exists) {
        query = query.startAfter(lastVisibleDoc);
      }
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      return res.status(200).json({ data: { products: [], lastVisible: null } });
    }

    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    const newLastVisible = lastDoc ? lastDoc.id : null;

    res.status(200).json({
      message: 'Products fetched successfully',
      data: { products, lastVisible: newLastVisible }
    });
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
 * Updates an existing product, regenerating search fields if the name changes.
 */
exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const dataToUpdate = req.body;

    if (dataToUpdate.name) {
      const { keywords, prefixes } = generateSearchableData(dataToUpdate.name);
      dataToUpdate.name_keywords = keywords;
      dataToUpdate.name_search_prefixes = prefixes; // <-- Add prefixes on update
    }

    dataToUpdate.updatedAt = new Date();
    const docRef = db.collection('products').doc(productId);
    await docRef.update(dataToUpdate);

    res.status(200).json({ message: `Product updated successfully` });
  } catch (error) {
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