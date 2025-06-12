const admin = require('firebase-admin');

// IMPORTANT: Path to your Firebase Service Account Key JSON file.
// We will get this file from the Firebase Console in the next steps.
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
// const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

console.log('Firebase Admin SDK initialized successfully.');

module.exports = { db };