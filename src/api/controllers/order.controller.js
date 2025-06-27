const { db } = require('../../config/firebase.config.js');
const { FieldValue } = require('firebase-admin/firestore');
// const { sendOrderStatusUpdateEmail } = require('../../services/emailService');
const { sendOrderStatusUpdateEmail } = require('../services/emailService');

/**
 * Creates a new order, calculates the total, and updates product stock
 * using a Firestore transaction.
 */
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.uid;
    // Destructure the new fields from the request body
    const { customerDetails, items, paymentMethod, shippingCost, totalAmount } = req.body;

    if (!customerDetails || !items || !Array.isArray(items) || items.length === 0 || !paymentMethod || totalAmount === undefined) {
      return res.status(400).json({ message: "Invalid order data. Missing required fields." });
    }

    const orderRef = db.collection('orders').doc();

    await db.runTransaction(async (transaction) => {
      let subtotal = 0;
      const processedItems = [];
      const productUpdates = [];

      for (const item of items) {
        const productRef = db.collection('products').doc(item.productId);
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists) throw new Error(`Product with ID ${item.productId} not found.`);

        const productData = productDoc.data();
        if (productData.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for product: ${productData.name}.`);
        }

        subtotal += productData.price * item.quantity;
        processedItems.push({
          productId: item.productId, name: productData.name,
          price: productData.price, quantity: item.quantity,
        });
        productUpdates.push({ ref: productRef, quantity: item.quantity });
      }

      // We will trust the final totals calculated by the frontend for now
      // A more robust solution would re-calculate and verify totals on the backend
      const finalOrder = {
        userId,
        customerDetails,
        items: processedItems,
        paymentMethod, // <-- Add payment method
        subtotal,
        shippingCost: shippingCost || 0, // <-- Add shipping cost
        totalAmount, // <-- Add final total cost
        orderStatus: 'Pending',
        paymentStatus: 'Paid', // Assuming payment is handled on the client
        createdAt: new Date(),
      };

      transaction.set(orderRef, finalOrder);
      productUpdates.forEach(update => {
        transaction.update(update.ref, { stockQuantity: FieldValue.increment(-update.quantity) });
      });

      return { id: orderRef.id, ...finalOrder };
    });

    // Note: To see these changes, you will need to create a new test order
    // from your main website after its checkout process is updated to send this new data.

    res.status(201).json({ message: 'Order created successfully' });

  } catch (error) {
    console.error("Error creating order: ", error);
    res.status(500).json({ message: 'Failed to create order.', error: error.message });
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

/**
 * Retrieves a paginated list of all orders, with search by customer name/email.
 */
exports.getAllOrders = async (req, res) => {
  try {
    const { lastVisible, searchTerm } = req.query;
    const ordersRef = db.collection('orders');
    let query = ordersRef.orderBy('createdAt', 'desc'); // Show newest orders first

    // IMPORTANT: Because Firestore cannot search inside nested objects with a query,
    // we will fetch all documents and filter on the server. This is acceptable
    // for a few hundred to a few thousand orders. For very large scale, a different
    // data structure (like duplicating customer name on the top level) would be needed.
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      // Fetch all orders and then filter
      const allOrdersSnapshot = await query.get();
      let allOrders = allOrdersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const filteredOrders = allOrders.filter(order => {
        const nameMatch = order.customerDetails?.name?.toLowerCase().includes(lowerCaseSearchTerm);
        const emailMatch = order.customerDetails?.email?.toLowerCase().includes(lowerCaseSearchTerm);
        return nameMatch || emailMatch;
      });

      // Note: This server-side filter doesn't support pagination.
      // We will return the full filtered list.
      return res.status(200).json({
        message: "Filtered orders fetched successfully",
        data: { orders: filteredOrders, lastVisible: null }
      });
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
      message: "All orders fetched successfully",
      data: { orders, lastVisible: newLastVisible }
    });

  } catch (error) {
    console.error("Error fetching all orders: ", error);
    res.status(500).json({ message: 'Failed to fetch all orders.', error: error.message });
  }
};

/**
 * Updates the status of a specific order and sends a notification.
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required." });
    }

    const orderRef = db.collection('orders').doc(orderId);
    const doc = await orderRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Update the status in Firestore
    await orderRef.update({ orderStatus: status, updatedAt: new Date() });

    const orderData = doc.data();

    // Send email notification after successful update
    if (orderData.customerDetails && orderData.customerDetails.email) {
      await sendOrderStatusUpdateEmail(
        orderData.customerDetails.email,
        orderData.customerDetails.name,
        orderId,
        status
      );
    }

    res.status(200).json({ message: `Order ${orderId} status updated to ${status}` });
  } catch (error) {
    console.error(`Error updating order status for ${req.params.orderId}:`, error);
    res.status(500).json({ message: 'Failed to update order status.', error: error.message });
  }
};

/**
 * Retrieves a single order by its ID.
 */
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const orderRef = db.collection('orders').doc(orderId);
    const doc = await orderRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.status(200).json({
      message: "Order fetched successfully",
      data: { id: doc.id, ...doc.data() }
    });

  } catch (error) {
    console.error(`Error fetching order ${req.params.orderId}:`, error);
    res.status(500).json({ message: 'Failed to fetch order.', error: error.message });
  }
};