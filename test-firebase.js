// A simple script to test the core Firebase Admin SDK connection.
const admin = require('firebase-admin');

// We load dotenv here directly to be 100% sure it's available.
require('dotenv').config();

try {
  console.log("Reading service account key from:", process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

  const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

  console.log("Initializing Firebase Admin SDK...");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("Firebase Admin SDK initialized successfully.");

  const db = admin.firestore();

  const testFirebaseConnection = async () => {
    try {
      console.log("Attempting to fetch a document from the 'products' collection...");
      // Replace with a real document ID from your 'products' collection in Firestore
      const docId = "Fkm2GIttagmNRl0jPRc6";
      const docRef = db.collection('products').doc(docId);
      const doc = await docRef.get();

      if (!doc.exists) {
        console.log(`✅ Test successful, but no document found with ID: ${docId}`);
      } else {
        console.log('✅ Test successful! Received document data:', doc.data());
      }
    } catch (e) {
      console.error("❌ ERROR: Failed to fetch from Firestore.", e);
    }
  };

  testFirebaseConnection();

} catch (error) {
  console.error("❌ ERROR: Failed to initialize Firebase Admin SDK.", error);
}