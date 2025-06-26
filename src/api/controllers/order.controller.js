const { db } = require('../../config/firebase.config.js');
const { FieldValue } = require('firebase-admin/firestore');

/**
 * Creates a new order, calculates the total, and updates product stock
 * using a Firestore transaction.
 */
exports.createOrder = async (req, res) => {
  try {
    // The user's ID is now available from our middleware!
    const userId = req.user.uid;
    const { customerDetails, items } = req.body;

    // --- 1. Validate Input ---
    if (!customerDetails || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid order data. Customer details and a non-empty items array are required." });
    }

    // --- 2. Use a Transaction to ensure data integrity ---
    const orderRef = db.collection('orders').doc(); // Create a reference for the new order

    const newOrder = await db.runTransaction(async (transaction) => {
      let subtotal = 0;
      const processedItems = [];
      const productUpdates = [];

      // --- 3. Fetch each product and validate the order ---
      for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity <= 0) {
          throw new Error(`Invalid data for item: ${JSON.stringify(item)}. Each item must have a valid productId and quantity.`);
        }

        const productRef = db.collection('products').doc(item.productId);
        const productDoc = await transaction.get(productRef);

        if (!productDoc.exists) {
          throw new Error(`Product with ID ${item.productId} not found.`);
        }

        const productData = productDoc.data();

        if (productData.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for product: ${productData.name}. Requested: ${item.quantity}, Available: ${productData.stockQuantity}.`);
        }

        // Use the price from the database, not the client
        subtotal += productData.price * item.quantity;

        // Add full product details to the order
        processedItems.push({
          productId: item.productId,
          name: productData.name,
          price: productData.price, // Price at time of purchase
          quantity: item.quantity,
        });

        // Prepare the stock update
        productUpdates.push({
          ref: productRef,
          quantity: item.quantity
        });
      }

      // --- 4. Assemble the final order object ---
      const finalOrder = {
        userId: userId, // <-- Link the order to the logged-in user
        customerDetails,
        items: processedItems,
        subtotal,
        // Placeholders for future phases
        shippingCost: 0,
        taxes: 0,
        totalAmount: subtotal, // For now, total is just subtotal
        orderStatus: 'Pending',
        paymentStatus: 'Unpaid',
        createdAt: new Date(),
      };

      // --- 5. Commit the operations to the database ---
      transaction.set(orderRef, finalOrder); // Create the new order

      // Update stock for each product
      productUpdates.forEach(update => {
        transaction.update(update.ref, {
          stockQuantity: FieldValue.increment(-update.quantity)
        });
      });

      return { id: orderRef.id, ...finalOrder };
    });

    // If the transaction is successful, send the response
    res.status(201).json({
      message: 'Order created successfully',
      order: newOrder
    });

  } catch (error) {
    console.error("Error creating order: ", error);
    // Give specific feedback for user errors, generic for server errors
    const isClientError = error.message.includes('not found') || error.message.includes('Insufficient stock') || error.message.includes('Invalid data');
    res.status(isClientError ? 400 : 500).json({ message: 'Failed to create order.', error: error.message });
  }
};

/**
 * Retrieves all orders for a specific user, with support for pagination and search by Order ID.
 */
exports.getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { lastVisible, searchTerm } = req.query; // Add searchTerm
    const ordersRef = db.collection('orders');

    let query = ordersRef.where('userId', '==', userId).orderBy('createdAt', 'desc');

    // --- NEW SEARCH LOGIC ---
    // If a search term is provided, we assume it's an Order ID.
    // We will fetch that specific order directly.
    if (searchTerm) {
      const doc = await ordersRef.doc(searchTerm).get();
      if (doc.exists && doc.data().userId === userId) {
        const order = { id: doc.id, ...doc.data() };
        // Return just this one order
        return res.status(200).json({ data: { orders: [order], lastVisible: null } });
      } else {
        // If no order is found with that ID for this user, return an empty list
        return res.status(200).json({ data: { orders: [], lastVisible: null } });
      }
    }

    // --- PAGINATION LOGIC (for non-search requests) ---
    query = query.limit(10);
    if (lastVisible) {
      const lastVisibleDoc = await ordersRef.doc(lastVisible).get();
      if (lastVisibleDoc.exists) {
        query = query.startAfter(lastVisibleDoc);
      }
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      return res.status(200).json({ data: { orders: [], lastVisible: null } });
    }

    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    const newLastVisible = lastDoc ? lastDoc.id : null;

    res.status(200).json({
      message: "User orders fetched successfully",
      data: { orders, lastVisible: newLastVisible }
    });

  } catch (error) {
    console.error("Error fetching user orders: ", error);
    res.status(500).json({ message: 'Failed to fetch user orders.', error: error.message });
  }
};