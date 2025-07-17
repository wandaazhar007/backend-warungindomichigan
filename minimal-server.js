// Load .env variables immediately
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// --- Firebase Initialization ---
let db;
try {
  // We use the path from your .env file
  const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  db = admin.firestore();
  console.log("✅ Minimal Server: Firebase Initialized Successfully.");
} catch (e) {
  console.error("❌ Minimal Server: FAILED TO INITIALIZE FIREBASE.", e);
  process.exit(1); // Exit if Firebase can't connect
}


// --- Express App Setup ---
const app = express();
app.use(cors());


// --- Test Route ---
app.get('/test-products', async (req, res) => {
  try {
    console.log("--- Handling request for /test-products ---");

    const snapshot = await db.collection('products').limit(5).get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log(`✅ Test successful! Found ${products.length} products.`);
    res.status(200).json({ products });
  } catch (error) {
    console.error("❌ Test route failed:", error);
    res.status(500).json({ message: "Error fetching data in test route." });
  }
});


// --- Start the Test Server ---
// Using a different port (9090) to avoid any conflicts
const PORT = 9090;
app.listen(PORT, () => {
  console.log(`✅ Minimal test server is running on http://localhost:${PORT}`);
  console.log(`--- Please test this URL in Postman now: http://localhost:${PORT}/test-products ---`);
});